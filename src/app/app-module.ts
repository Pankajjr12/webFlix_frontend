import {  NgModule, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Landing } from './landing/landing';
import { SharedModule } from './shared/shared-module';
import { Signup } from './signup/signup';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { Login } from './login/login';

import { Home } from './user/home/home';
import { authInterceptor } from './shared/interceptors/auth-interceptor';
import { ForgotPassword } from './forgot-password/forgot-password';
import { AuthService } from './shared/services/auth-service';
import { ResetPassword } from './reset-password/reset-password';
import { EmailVerify } from './email-verify/email-verify';
import { MyFavorites } from './user/home/my-favorites/my-favorites';


@NgModule({
  declarations: [
    App,
    Landing,
    Signup,
    Login,
    EmailVerify,
    Home,
    ForgotPassword,
    ResetPassword,
    MyFavorites,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [
    provideAppInitializer(()=> {
      const auth = inject(AuthService);
      return auth.initializeAuth();
    }),
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
  bootstrap: [App]
})
export class AppModule { }
