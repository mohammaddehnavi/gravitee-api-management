/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, inject, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ConnectionLog } from '../../../../../../entities/management-api-v2';
import { LogsIaAgentDetailsComponent } from '../logs-ia-agent-details/logs-ia-agent-details.component';

@Component({
  selector: 'api-runtime-logs-list-row',
  templateUrl: './api-runtime-logs-list-row.component.html',
  styleUrls: ['./api-runtime-logs-list-row.component.scss'],
})
export class ApiRuntimeLogsListRowComponent {
  matDialog = inject(MatDialog);

  @Input()
  log: ConnectionLog;

  @Input()
  index?: number;

  @Input()
  isMessageApi: boolean;

  get isAiRequest(): boolean {
    return !!this.log.custom['agent-metrics'] || false;
  }

  viewAiAgent(log: ConnectionLog) {
    this.matDialog.open(LogsIaAgentDetailsComponent, {
      data: log,
    });
  }
}
