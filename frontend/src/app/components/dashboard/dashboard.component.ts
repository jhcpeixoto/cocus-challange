import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {TransactionService} from '../../services/transaction.service';
import {Router} from '@angular/router';
import {MaterialModule} from '../../material.module';
import {DecimalPipe} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [MaterialModule, DecimalPipe, MatProgressSpinner],
})
export class DashboardComponent implements OnInit {
  balance: number = 0;
  amount: number = 0;
  error: string | null = null;
  isDarkMode = false;
  isLoading = false;

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBalance();
    const darkModeStored = localStorage.getItem('darkMode');
    this.isDarkMode = darkModeStored === 'true';
    this.applyDarkMode();
  }

  loadBalance(): void {
    this.transactionService.getBalance().subscribe({
      next: (balance) => {
        this.balance = balance;
      },
      error: (err) => {
        this.error = 'Failed to load balance: ' + err.message;
      },
    });
  }

  deposit(): void {
    this.error = null;
    if (this.amount <= 0) {
      this.error = 'Please enter a positive amount';
      return;
    }
    this.isLoading = true;
    this.transactionService.deposit(this.amount).subscribe({
      next: (newBalance) => {
        this.balance = newBalance;
        this.amount = 0;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.log('Withdraw error:', err);
        const errorMessage =
          err?.errors?.[0]?.message || err.message || 'Unknown error';
        this.error = 'Withdraw failed: ' + errorMessage;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
    });
  }

  withdraw(): void {
    this.error = null;
    if (this.amount <= 0) {
      this.error = 'Please enter a positive amount';
      return;
    }
    this.isLoading = true;
    this.transactionService.withdraw(this.amount).subscribe({
      next: (newBalance) => {
        this.balance = newBalance;
        this.amount = 0;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.log('Withdraw error:', err);
        const errorMessage =
          err?.errors?.[0]?.message || err.message || 'Unknown error';
        this.error = 'Withdraw failed: ' + errorMessage;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/auth']),
      error: (err) => console.error('Logout error:', err),
    });
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyDarkMode();
  }

  applyDarkMode(): void {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  goToHistory(): void {
    this.router.navigate(['/transactions']);
  }
}
