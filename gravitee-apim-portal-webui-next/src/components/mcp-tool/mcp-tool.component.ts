import {Component, computed, input, OnInit, Signal} from '@angular/core';
import {MCPTool} from "../../entities/api/mcp";
import {MatExpansionModule} from "@angular/material/expansion";
import {JsonPipe} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FormControl, ReactiveFormsModule, UntypedFormGroup} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {toSignal} from "@angular/core/rxjs-interop";
import { map} from "rxjs";
import {CopyCodeIconComponent} from "../copy-code/copy-code-icon/copy-code-icon/copy-code-icon.component";

interface RequestVM {
  jsonrpc: string;
  id: number;
  method: string;
  params: {
    name: string;
    arguments: Arguments;
  }
}

interface Arguments {
  [property: string]: string;
}

interface PropertyVM {
  name: string;
  description?: string;
  value?: string;
  required?: boolean;
}

@Component({
  selector: 'app-mcp-tool',
  standalone: true,
  imports: [MatExpansionModule, JsonPipe, ReactiveFormsModule, MatFormFieldModule, MatInput, CopyCodeIconComponent],
  templateUrl: './mcp-tool.component.html',
  styleUrl: './mcp-tool.component.scss'
})
export class McpToolComponent implements OnInit {
  tool = input.required<MCPTool>();

  toolToPropertyVMs: Signal<PropertyVM[]> = computed(() => {
    const properties = this.tool().inputSchema.properties ?? {};
    const requiredProperties = this.tool().inputSchema?.required ?? [];
    if (Object.entries(properties).length) {
      return Object.entries(properties)
        .map(([key, property]) =>
          ({name: key, description: property.description, value: '', required: this.tool().inputSchema.required && requiredProperties.includes(key)}))
    }
    return [];
  })

  form: UntypedFormGroup = new UntypedFormGroup({});

  args: Signal<Arguments | undefined> = toSignal(this.form.valueChanges.pipe(
    map((values) => {
      const args: Arguments = {};
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === "string") {
          args[key] = value
        }
      })
      return args;
    })));

  display: Signal<RequestVM> = computed(() => {
    const args: Arguments = this.args() ?? {};
        return {
          jsonrpc: "2.0",
          id: 2,
          method: "tools/call",
          params: {
            name: this.tool().name,
            arguments: args,
          }
      };
  })

  ngOnInit() {
    const propertyVms = this.toolToPropertyVMs();
    propertyVms.forEach((property) => {
      this.form.addControl(property.name, new FormControl(''));
    })
  }
}
