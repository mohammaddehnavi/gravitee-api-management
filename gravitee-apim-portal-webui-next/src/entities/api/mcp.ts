export interface MCP {
  enabled: boolean;
  tools?: MCPTool[]
}

export interface MCPTool {
  name: string;
  type: string;
  description?: boolean;
  inputSchema: MCPInputSchema;
}


export interface MCPInputSchema {
  type: string;
  properties: MCPInputSchemaProperties;
  required?: string[];
}

export interface MCPInputSchemaProperties {
  [property: string]: MCPInputSchemaProperty;
}

export interface MCPInputSchemaProperty {
  type: 'string' | 'number';
  description?: string;
}
