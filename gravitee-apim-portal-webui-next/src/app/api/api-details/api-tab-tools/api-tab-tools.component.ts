import {Component, computed, input, Input} from '@angular/core';
import {Api} from "../../../../entities/api/api";
import {McpToolComponent} from "../../../../components/mcp-tool/mcp-tool.component";

@Component({
  selector: 'app-api-tab-tools',
  standalone: true,
  imports: [
    McpToolComponent
  ],
  templateUrl: './api-tab-tools.component.html',
  styleUrl: './api-tab-tools.component.scss'
})
export class ApiTabToolsComponent {
  api = input.required<Api>();

  mcpTools = computed(() => this.api().mcp?.tools ?? []);
}
