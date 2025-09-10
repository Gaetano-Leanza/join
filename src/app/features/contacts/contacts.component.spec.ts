import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsComponent } from './contacts.component';

/**
 * @description Test suite for the ContactsComponent.
 */
describe('ContactsComponent', () => {
  let component: ContactsComponent;
  let fixture: ComponentFixture<ContactsComponent>;

  /**
   * @description This function runs before each test in the suite.
   * It sets up the testing environment and creates an instance of the component.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactsComponent);
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
