import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestDetailsModalComponent } from './request-details-modal.component';

describe('RequestDetailsModalComponent', () => {
  let component: RequestDetailsModalComponent;
  let fixture: ComponentFixture<RequestDetailsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestDetailsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
