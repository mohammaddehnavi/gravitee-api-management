/*
 * Copyright © 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package io.gravitee.repository.mongodb.common;

import com.mongodb.ClientEncryptionSettings;
import com.mongodb.client.model.vault.DataKeyOptions;
import com.mongodb.client.vault.ClientEncryption;
import com.mongodb.client.vault.ClientEncryptions;
import io.gravitee.repository.mongodb.management.mapper.GraviteeMapper;
import io.gravitee.repository.mongodb.management.transaction.NoTransactionManager;
import java.net.URI;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.bson.BsonBinary;
import org.bson.BsonDocument;
import org.bson.BsonValue;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.context.annotation.Conditional;
import org.springframework.core.env.Environment;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.data.annotation.Persistent;
import org.springframework.data.convert.PropertyValueConverterFactory;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;
import org.springframework.data.mongodb.core.convert.encryption.MongoEncryptionConverter;
import org.springframework.data.mongodb.core.encryption.Encryption;
import org.springframework.data.mongodb.core.encryption.EncryptionKey;
import org.springframework.data.mongodb.core.encryption.EncryptionKeyResolver;
import org.springframework.data.mongodb.core.encryption.MongoClientEncryption;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.util.ClassUtils;
import org.springframework.util.StringUtils;

/**
 * @author David BRASSELY (david.brassely at graviteesource.com)
 * @author GraviteeSource Team
 */
public abstract class AbstractRepositoryConfiguration extends AbstractMongoClientConfiguration implements InitializingBean {

    public static final String KEY_NAME = "demo-data-key";
    protected final Environment environment;

    protected ApplicationContext applicationContext;

    protected AbstractRepositoryConfiguration(Environment environment, ApplicationContext applicationContext) {
        this.environment = environment;
        this.applicationContext = applicationContext;
    }

    @Override
    public void afterPropertiesSet() throws Exception {
        final ConfigurableListableBeanFactory beanFactory = getConfigurableApplicationContext(applicationContext).getBeanFactory();
        beanFactory.registerSingleton("graviteeTransactionManager", new NoTransactionManager());
    }

    //    @Override
    //    public void setApplicationContext(@NonNull ApplicationContext applicationContext) throws BeansException {
    //        this.applicationContext = applicationContext;
    //    }

    private ConfigurableApplicationContext getConfigurableApplicationContext(ApplicationContext applicationContext) {
        return (ConfigurableApplicationContext) Optional.ofNullable(applicationContext.getParent()).orElse(applicationContext);
    }

    @Override
    protected String getDatabaseName() {
        String uri = environment.getProperty("management.mongodb.uri");
        if (uri != null && !uri.isEmpty()) {
            // Remove user:password from the URI as it can contain special characters and isn't needed for the database name
            String uriWithoutCredentials = uri.replaceAll("://.*@", "://");
            return URI.create(uriWithoutCredentials).getPath().substring(1);
        }

        return environment.getProperty("management.mongodb.dbname", "gravitee");
    }

    @Bean
    public GraviteeMapper graviteeMapper() {
        return Mappers.getMapper(GraviteeMapper.class);
    }

    @Override
    protected Set<Class<?>> getInitialEntitySet() throws ClassNotFoundException {
        Collection<String> basePackages = getMappingBasePackages();
        Set<Class<?>> initialEntitySet = new HashSet<>();

        for (String basePackage : basePackages) {
            if (StringUtils.hasText(basePackage)) {
                ClassPathScanningCandidateComponentProvider componentProvider = new ClassPathScanningCandidateComponentProvider(false);
                componentProvider.addIncludeFilter(new AnnotationTypeFilter(Document.class));
                componentProvider.addIncludeFilter(new AnnotationTypeFilter(Persistent.class));

                for (BeanDefinition candidate : componentProvider.findCandidateComponents(basePackage)) {
                    Class<?> entity = ClassUtils.forName(candidate.getBeanClassName(), this.getClass().getClassLoader());
                    initialEntitySet.add(entity);
                }
            }
        }
        return initialEntitySet;
    }

    @Bean
    @Conditional(EncryptionEnabledCondition.class)
    public ClientEncryption clientEncryption(MongoFactory mongoFactory) {
        ClientEncryptionSettings.Builder builder = ClientEncryptionSettings.builder();

        // Key Management System  (KMS)providers. Here we use a local one for testing.
        Map<String, Map<String, Object>> kmsProviders = new HashMap<>();
        Map<String, Object> localKmsProvider = new HashMap<>();
        localKmsProvider.put(
            "key",
            "s1LSgcxwixnMWuPMWuNQpZZVHbaaT9pbyAuqrExk38gmcgg9DomK7IoYsvWpG+aZcOB7MfGTdRVILjNWL4mbEQ00f0Kz+W6f9Hu+npzOpMsbkH3SC/FlJEaeWrwavNQZ"
        );
        kmsProviders.put("local", localKmsProvider);

        builder
            // `keyVaultDatabaseName.keyVaultCollectionName`
            // The database.collection in MongoDB where the Data Encryption Keys (DEKs) will be stored.
            .keyVaultNamespace("encryption.__dataKeys")
            .keyVaultMongoClientSettings(mongoFactory.buildClientSettingsFromProperties(false))
            .kmsProviders(kmsProviders);

        ClientEncryption clientEncryption = ClientEncryptions.create(builder.build());

        // Initialize the Data Encryption Key if not already existing.
        BsonDocument keyByAltName = clientEncryption.getKeyByAltName(KEY_NAME);

        if (keyByAltName == null) {
            clientEncryption.createDataKey("local", new DataKeyOptions().keyAltNames(List.of(KEY_NAME)));
            // clientEncryption.rewrapManyDataKey(eq("keyAltNames", "demo-data-key"), new RewrapManyDataKeyOptions().provider("local"));
        }
        return clientEncryption;
    }

    @Bean
    @Conditional(EncryptionEnabledCondition.class)
    public MongoEncryptionConverter encryptingConverter(ClientEncryption clientEncryption) {
        Encryption<BsonValue, BsonBinary> encryption = MongoClientEncryption.just(clientEncryption);
        EncryptionKeyResolver keyResolver = EncryptionKeyResolver.annotated(ctx -> EncryptionKey.keyAltName(KEY_NAME));

        return new MongoEncryptionConverter(encryption, keyResolver);
    }

    @Override
    protected void configureConverters(MongoCustomConversions.MongoConverterConfigurationAdapter adapter) {
        adapter.registerPropertyValueConverterFactory(PropertyValueConverterFactory.beanFactoryAware(applicationContext));
    }
}
