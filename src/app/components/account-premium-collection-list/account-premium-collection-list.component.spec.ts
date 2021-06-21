import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPremiumCollectionListComponent } from './account-premium-collection-list.component';

describe('AccountPremiumCollectionListComponent', () => {
  let component: AccountPremiumCollectionListComponent;
  let fixture: ComponentFixture<AccountPremiumCollectionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountPremiumCollectionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountPremiumCollectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
