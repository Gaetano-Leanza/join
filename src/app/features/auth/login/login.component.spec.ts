import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';

/**
 * Test suite for the LoginComponent.
 */
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  /**
   * Asynchronously sets up the test environment for the LoginComponent before each test.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /**
   * Test case to verify that the LoginComponent is created successfully.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
