import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardComponent } from './board.component';

/**
 * Test suite for the BoardComponent.
 */
describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;

  /**
   * Asynchronously configures the test module before each test run.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
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
