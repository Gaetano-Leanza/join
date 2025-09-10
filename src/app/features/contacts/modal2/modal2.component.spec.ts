import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Modal2Component } from './modal2.component';

/**
 * @description Test suite for the Modal2Component.
 */
describe('Modal2Component', () => {
  let component: Modal2Component;
  let fixture: ComponentFixture<Modal2Component>;

  /**
   * @description This function runs before each test in the suite.
   * It sets up the testing environment and creates an instance of the component.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modal2Component],
    }).compileComponents();

    fixture = TestBed.createComponent(Modal2Component);
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
