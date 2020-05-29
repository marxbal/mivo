import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateThirdPartyComponent } from './create-third-party.component';

describe('CreateThirdPartyComponent', () => {
  let component: CreateThirdPartyComponent;
  let fixture: ComponentFixture<CreateThirdPartyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateThirdPartyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateThirdPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
