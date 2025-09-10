import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoComponent } from './info.component';

/**
 * @description Test suite for the InfoComponent.
 */
describe('InfoComponent', () => {
  let component: InfoComponent;
  let fixture: ComponentFixture<InfoComponent>;

  /**
   * @description This function runs before each test in the suite.
   * It sets up the testing environment and creates an instance of the component.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoComponent);
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
