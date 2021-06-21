import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientClaimsListComponent } from './client-claims-list.component';

describe('ClientClaimsListComponent', () => {
  let component: ClientClaimsListComponent;
  let fixture: ComponentFixture<ClientClaimsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientClaimsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientClaimsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
