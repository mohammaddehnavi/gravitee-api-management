import { AfterViewInit, Component, ElementRef, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

import { ConnectionLog } from '../../../../../../entities/management-api-v2';

@Component({
  selector: 'logs-ia-agent-details',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose],
  templateUrl: './logs-ia-agent-details.component.html',
  styleUrl: './logs-ia-agent-details.component.scss',
})
export class LogsIaAgentDetailsComponent implements AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  data: ConnectionLog = inject(MAT_DIALOG_DATA);

  responseTime?: number;
  tokenUsage?: number;
  chainOfThought: {
    name: string;
    input: string;
    log: string;
  }[];
  ngAfterViewInit(): void {
    const agent = JSON.parse(this.data.custom['agent-metrics']);
    this.responseTime = agent.responseTime;
    this.tokenUsage = agent.tokenUsage;
    this.chainOfThought = agent.chainOfThought;
  }
}
