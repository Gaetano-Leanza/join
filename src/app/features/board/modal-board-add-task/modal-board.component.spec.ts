import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBoardAddTaskComponent } from './modal-board-add-task.component';

/**
 * Test suite for the ModalBoardAddTaskComponent.
 */
describe('ModalBoardAddTaskComponent', () => {
  let component: ModalBoardAddTaskComponent;
  let fixture: ComponentFixture<ModalBoardAddTaskComponent>;

  /**
   * Asynchronously configures the test module before each test run.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalBoardAddTaskComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalBoardAddTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Test case to ensure the component is created successfully.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
