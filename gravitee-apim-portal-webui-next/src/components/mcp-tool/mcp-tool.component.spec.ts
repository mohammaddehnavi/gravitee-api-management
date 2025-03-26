import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McpToolComponent } from './mcp-tool.component';

describe('McpToolComponent', () => {
  let component: McpToolComponent;
  let fixture: ComponentFixture<McpToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McpToolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(McpToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
