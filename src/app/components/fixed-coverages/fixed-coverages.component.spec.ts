import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedCoveragesComponent } from './fixed-coverages.component';

describe('FixedCoveragesComponent', () => {
  let component: FixedCoveragesComponent;
  let fixture: ComponentFixture<FixedCoveragesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedCoveragesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedCoveragesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
