import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardModalEditComponent } from './board-modal-edit.component';

/**
 * Test suite for the BoardModalEditComponent.
 */
describe('BoardModalEditComponent', () => {
  let component: BoardModalEditComponent;
  let fixture: ComponentFixture<BoardModalEditComponent>;

  /**
   * Asynchronously sets up the testing environment for the BoardModalEditComponent before each test.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardModalEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardModalEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Test case to verify that the BoardModalEditComponent is created successfully.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
