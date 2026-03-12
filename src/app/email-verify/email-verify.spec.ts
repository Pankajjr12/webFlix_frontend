import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailVerify } from './email-verify';

describe('EmailVerify', () => {
  let component: EmailVerify;
  let fixture: ComponentFixture<EmailVerify>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmailVerify]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailVerify);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
