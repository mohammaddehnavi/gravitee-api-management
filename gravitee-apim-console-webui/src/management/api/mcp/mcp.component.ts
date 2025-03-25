import {Component, Input, OnInit} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatExpansionModule} from "@angular/material/expansion";
import {ApiV2Service} from "../../../services-ngx/api-v2.service";
import {EMPTY, Observable} from "rxjs";
import {MCP} from "../../../entities/management-api-v2";
import {map} from "rxjs/operators";
import {AsyncPipe} from "@angular/common";
import {McpToolReadComponent} from "./mcp-tool-read/mcp-tool-read.component";
import {ActivatedRoute} from "@angular/router";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatIcon, MatIconModule} from "@angular/material/icon";

@Component({
  selector: 'mcp',
  standalone: true,
  imports: [MatCardModule, MatExpansionModule, AsyncPipe, McpToolReadComponent, MatButtonModule, MatIconModule],
  templateUrl: './mcp.component.html',
  styleUrl: './mcp.component.scss'
})
export class McpComponent implements OnInit {

  mcp$: Observable<MCP>;
  private apiId = this.activatedRoute.snapshot.params.apiId;

  constructor(private readonly apiServiceV2: ApiV2Service, private readonly activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.mcp$ = this.apiServiceV2.get(this.apiId).pipe(map((api) => {
      if (api.definitionVersion === "V4" && api.mcp?.enabled) {
        return api.mcp;
      }
    }));
  }
}
