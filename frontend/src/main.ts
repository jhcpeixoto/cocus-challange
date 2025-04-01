import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {lastValueFrom} from 'rxjs';
import {AuthService} from './app/services/auth.service';
import {appConfig} from './app/app.config';

async function main() {
    // Bootstrap the application first
    const appRef = await bootstrapApplication(AppComponent, appConfig);

    // Get the AuthService instance from the application's injector
    const authService = appRef.injector.get(AuthService);

    try {
        // Wait until autoLogin completes, so that isAuthenticated$ is updated
        const loggedIn = await lastValueFrom(authService.autoLogin());
        console.log('Auto-login success:', loggedIn);
    } catch (error) {
        console.error('Auto-login failed:', error);
    }
}

main().catch(err => console.error(err));
