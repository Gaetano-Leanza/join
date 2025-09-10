import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBoardComponent } from './modal-board.component';

/**
 * Test suite for the ModalBoardComponent.
 */
describe('ModalBoardComponent', () => {
  let component: ModalBoardComponent;
  let fixture: ComponentFixture<ModalBoardComponent>;

  /**
   * Asynchronously sets up the testing module and creates the component instance
   * before each test is run.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalBoardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalBoardComponent);
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
