import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiTabToolsComponent } from './api-tab-tools.component';

describe('ApiTabToolsComponent', () => {
  let component: ApiTabToolsComponent;
  let fixture: ComponentFixture<ApiTabToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiTabToolsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiTabToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
