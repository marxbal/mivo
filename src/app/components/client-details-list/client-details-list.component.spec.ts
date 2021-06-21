import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDetailsListComponent } from './client-details-list.component';

describe('ClientDetailsListComponent', () => {
  let component: ClientDetailsListComponent;
  let fixture: ComponentFixture<ClientDetailsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientDetailsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientDetailsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
