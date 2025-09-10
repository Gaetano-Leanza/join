import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddTaskComponent } from './add-task.component';

/**
 * Test suite for the AddTaskComponent.
 */
describe('AddTaskComponent', () => {
  let component: AddTaskComponent;
  let fixture: ComponentFixture<AddTaskComponent>;

  /**
   * Asynchronous setup function to configure the testing module before each test.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTaskComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Test case to ensure that the component is created successfully.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});