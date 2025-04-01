import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {combineLatest, Observable} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return combineLatest([this.authService.initialized$, this.authService.isAuthenticated$]).pipe(
      filter(([initialized, _]) => initialized),
      take(1),
      map(([_, isAuthenticated]) => {
        if (!isAuthenticated) {
          this.router.navigate(['/auth']);
          return false;
        }
        return true;
      })
    );
  }
}
