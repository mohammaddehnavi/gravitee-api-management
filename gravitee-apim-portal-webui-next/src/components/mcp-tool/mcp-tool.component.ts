import {Component, computed, input, OnInit, Signal} from '@angular/core';
import {MCPTool} from "../../entities/api/mcp";
import {MatExpansionModule} from "@angular/material/expansion";
import {JsonPipe} from "@angular/common";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {FormControl, FormGroup, ReactiveFormsModule, UntypedFormGroup} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {toSignal} from "@angular/core/rxjs-interop";
import {map} from "rxjs";

interface RequestVM {
  jsonrpc: string;
  id: string;
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

interface DisplayVMs {
  [property: string]: string;
}

@Component({
  selector: 'app-mcp-tool',
  standalone: true,
  imports: [MatExpansionModule, JsonPipe, ReactiveFormsModule, MatFormFieldModule, MatInput],
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
        .map(([key, property]) => ({name: key, description: property.description, value: '', required: this.tool().inputSchema.required && requiredProperties.includes(key)}))
    }
    return [];
  })

  form: UntypedFormGroup = new UntypedFormGroup({});

  // display: Signal<DisplayVMs> = toSignal(this.form.valueChanges.pipe(
  //   map((values) => {
  //     // figure out how to for each value, create an entry with the key + value in the display
  //   })
  // ))

  ngOnInit() {
    const propertyVms = this.toolToPropertyVMs();
    propertyVms.forEach((property) => {
      this.form.addControl(property.name, new FormControl(''));
    })
  }
}
