import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalNoticeComponent } from './legal-notice.component';

/**
 * @description Test suite for the LegalNoticeComponent.
 */
describe('LegalNoticeComponent', () => {
  let component: LegalNoticeComponent;
  let fixture: ComponentFixture<LegalNoticeComponent>;

  /**
   * @description This function runs before each test in the suite.
   * It sets up the testing environment and creates an instance of the component.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalNoticeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LegalNoticeComponent);
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
