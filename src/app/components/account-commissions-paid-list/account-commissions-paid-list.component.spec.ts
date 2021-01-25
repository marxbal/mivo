import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountCommissionsPaidListComponent } from './account-commissions-paid-list.component';

describe('AccountCommissionsPaidListComponent', () => {
  let component: AccountCommissionsPaidListComponent;
  let fixture: ComponentFixture<AccountCommissionsPaidListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountCommissionsPaidListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountCommissionsPaidListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
