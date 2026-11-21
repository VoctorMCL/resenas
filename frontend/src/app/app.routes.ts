import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { loginGuard } from './guards/login-guard';
import { Home } from './components/home/home';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    {
        path: 'login',
        component: Login,
        canActivate: [loginGuard]
    },
    {
        path: 'home',
        component: Home,
        canActivate: [authGuard]
    },
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
