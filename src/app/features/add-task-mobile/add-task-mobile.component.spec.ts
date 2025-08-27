import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTaskMobileComponent } from './add-task-mobile.component';

describe('AddTaskMobileComponent', () => {
  let component: AddTaskMobileComponent;
  let fixture: ComponentFixture<AddTaskMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaskMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
