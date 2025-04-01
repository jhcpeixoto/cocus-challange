import {Routes} from '@angular/router';
import {AuthComponent} from './components/auth/auth.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {TransactionHistoryComponent} from './components/transaction-history/transaction-history.component';
import {AuthGuard} from './guards/auth.guard';
import {NoAuthGuard} from "./guards/noAuth.guard";

export const routes: Routes = [
    { path: 'auth', component: AuthComponent, canActivate: [NoAuthGuard] },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'transactions', component: TransactionHistoryComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: '**', redirectTo: '/dashboard' },
];
