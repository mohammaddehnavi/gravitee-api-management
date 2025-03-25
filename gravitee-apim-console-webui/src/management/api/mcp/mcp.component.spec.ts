import { ComponentFixture, TestBed } from '@angular/core/testing';

import { McpComponent } from './mcp.component';

describe('McpComponent', () => {
  let component: McpComponent;
  let fixture: ComponentFixture<McpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [McpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(McpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
