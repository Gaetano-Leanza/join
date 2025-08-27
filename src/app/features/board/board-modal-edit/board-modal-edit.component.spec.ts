import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardModalEditComponent } from './board-modal-edit.component';

describe('BoardModalEditComponent', () => {
  let component: BoardModalEditComponent;
  let fixture: ComponentFixture<BoardModalEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardModalEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardModalEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
