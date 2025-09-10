import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComponent } from './modal.component';

/**
 * @description Test suite for the ModalComponent.
 */
describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  /**
   * @description This function runs before each test in the suite.
   * It sets up the testing environment and creates an instance of the component.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * @description Test case to ensure that the component is created successfully.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
