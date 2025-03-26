import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogsIaAgentDetailsComponent } from './logs-ia-agent-details.component';

describe('LogsIaAgentDetailsComponent', () => {
  let component: LogsIaAgentDetailsComponent;
  let fixture: ComponentFixture<LogsIaAgentDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogsIaAgentDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogsIaAgentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
