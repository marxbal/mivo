import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountOutstandingBillsListComponent } from './account-outstanding-bills-list.component';

describe('AccountOutstandingBillsListComponent', () => {
  let component: AccountOutstandingBillsListComponent;
  let fixture: ComponentFixture<AccountOutstandingBillsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountOutstandingBillsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountOutstandingBillsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
