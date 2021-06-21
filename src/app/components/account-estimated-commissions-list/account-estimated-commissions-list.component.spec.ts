import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountEstimatedCommissionsListComponent } from './account-estimated-commissions-list.component';

describe('AccountEstimatedCommissionsListComponent', () => {
  let component: AccountEstimatedCommissionsListComponent;
  let fixture: ComponentFixture<AccountEstimatedCommissionsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountEstimatedCommissionsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountEstimatedCommissionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
