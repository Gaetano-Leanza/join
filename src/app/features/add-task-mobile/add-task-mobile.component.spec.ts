import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTaskMobileComponent } from './add-task-mobile.component';

/**
 * Test suite for the AddTaskMobileComponent.
 */
describe('AddTaskMobileComponent', () => {
  let component: AddTaskMobileComponent;
  let fixture: ComponentFixture<AddTaskMobileComponent>;

  /**
   * Asynchronously configures and prepares the testing environment for the component before each test.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaskMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Test case to ensure that the AddTaskMobileComponent instance is created successfully.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});