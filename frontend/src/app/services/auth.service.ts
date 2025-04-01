import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {
    FORGOT_PASSWORD_MUTATION,
    LOGIN_MUTATION,
    LOGOUT_MUTATION,
    REFRESH_MUTATION,
    REGISTER_MUTATION,
    RESET_PASSWORD_MUTATION
} from '../graphql/auth/auth.mutations';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    // Indicates whether the user is authenticated
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    // Indicates whether autoLogin (refresh) has finished
    private initializedSubject = new BehaviorSubject<boolean>(false);
    initialized$ = this.initializedSubject.asObservable();

    constructor(private apollo: Apollo) {}

    // Call this on app startup to update auth state.
    autoLogin(): Observable<boolean> {
        return this.apollo.mutate({
            mutation: REFRESH_MUTATION,
            // No variables, since the refresh token is read from cookies
        }).pipe(
            tap(({ data }: any) => {
                // If refresh is successful, mark authenticated
                if (data && data.refresh) {
                    this.isAuthenticatedSubject.next(true);
                } else {
                    this.isAuthenticatedSubject.next(false);
                }
                // Mark that initialization is complete
                this.initializedSubject.next(true);
            }),
            map(({ data }: any) => !!(data && data.refresh)),
            catchError((error) => {
                console.error('Auto-login failed:', error);
                this.isAuthenticatedSubject.next(false);
                this.initializedSubject.next(true);
                return of(false);
            })
        );
    }

    register(email: string, password: string): Observable<any> {
        return this.apollo.mutate({
            mutation: REGISTER_MUTATION,
            variables: { input: { email, password } },
        }).pipe(
            tap(() => {
                this.isAuthenticatedSubject.next(true);
            }),
            catchError((error) => {
                console.error('Registration failed:', error);
                return throwError(() => error);
            })
        );
    }

    login(email: string, password: string): Observable<any> {
        return this.apollo.mutate({
            mutation: LOGIN_MUTATION,
            variables: { input: { email, password } },
        }).pipe(
            tap(() => {
                this.isAuthenticatedSubject.next(true);
            }),
            catchError((error) => {
                console.error('Login failed:', error);
                return throwError(() => error);
            })
        );
    }

    refresh(): Observable<any> {
        return this.apollo.mutate({
            mutation: REFRESH_MUTATION,
            variables: { input: {} },
        }).pipe(
            tap(() => {
                this.isAuthenticatedSubject.next(true);
            }),
            catchError((error) => {
                console.error('Token refresh failed:', error);
                this.logout();
                return throwError(() => error);
            })
        );
    }

    forgotPassword(email: string): Observable<string> {
        return this.apollo.mutate({
            mutation: FORGOT_PASSWORD_MUTATION,
            variables: { input: { email } },
        }).pipe(
            map(({ data }: any) => data.forgotPassword as string),
            catchError((error) => {
                console.error('Forgot password failed:', error);
                return throwError(() => error);
            })
        );
    }

    resetPassword(passwordToken: string, newPassword: string): Observable<boolean> {
        return this.apollo.mutate({
            mutation: RESET_PASSWORD_MUTATION,
            variables: { input: { passwordToken, newPassword } },
        }).pipe(
            map(({ data }: any) => true),
            catchError((error) => {
                console.error('Reset password failed:', error);
                return throwError(() => error);
            })
        );
    }

    logout(): Observable<any> {
        return this.apollo.mutate({
            mutation: LOGOUT_MUTATION,
            variables: {},
        }).pipe(
            tap(() => {
                this.clearAuthData();
            }),
            catchError((error) => {
                console.error('Logout failed:', error);
                this.clearAuthData();
                return throwError(() => error);
            })
        );
    }

    private clearAuthData(): void {
        this.isAuthenticatedSubject.next(false);
    }
}
