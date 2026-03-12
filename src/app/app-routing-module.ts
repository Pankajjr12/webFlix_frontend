import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Landing } from './landing/landing';
import { Signup } from './signup/signup';
import { Login } from './login/login';
import { Home } from './user/home/home';
import { EmailVerify } from './email-verify/email-verify';
import { authGuard } from './shared/guards/auth-guard';
import { AdminModule } from '../app/admin/admin-module';
import { adminGuard } from './shared/guards/admin-guard';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ResetPassword } from './reset-password/reset-password';
import { MyFavorites } from './user/home/my-favorites/my-favorites';



const routes: Routes = [
  { path: '', component: Landing },

  { path: 'signup', component: Signup },
  { path: 'verify-email', component: EmailVerify },
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },

  // ✅ USER HOME
  { path: 'home', component: Home, canActivate: [authGuard] },
  { path: 'my-favorites', component: MyFavorites, canActivate: [authGuard] },

  // ✅ ADMIN MODULE (IMPORTANT: use admin path)
  {
    path: 'admin',
    loadChildren: () =>
      import('../app/admin/admin-module').then(m => m.AdminModule),
    canActivate: [adminGuard]
  },

  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
