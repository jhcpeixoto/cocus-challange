import {Component, OnInit, ViewChild} from '@angular/core';
import {TransactionService} from '../../services/transaction.service';
import {MaterialModule} from '../../material.module';
import {DatePipe, DecimalPipe} from '@angular/common';
import {Router} from "@angular/router";
import {ReactiveFormsModule} from "@angular/forms";
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatOption, MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
  standalone: true,
  imports: [MaterialModule, DecimalPipe, DatePipe, ReactiveFormsModule, MatPaginator, MatSelect, MatOption],
})
export class TransactionHistoryComponent implements OnInit {
  transactions: any[] = [];
  totalTransactions: number = 0;
  error: string | null = null;
  displayedColumns: string[] = ['type', 'amount', 'timestamp', 'updatedBalance'];
  pageSize = 10;
  pageIndex = 0;
  filterType: string = 'All';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private transactionService: TransactionService, private router: Router) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.getTransactions(this.pageIndex, this.pageSize, this.filterType).subscribe({
      next: (result: any) => {
        this.transactions = result.transactions;
        this.totalTransactions = result.totalCount;
      },
      error: (err) => {
        this.error = 'Failed to load transactions: ' + err.message;
      },
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTransactions();
  }

  onFilterChange(filter: string): void {
    this.filterType = filter;
    // Reset pagination if needed
    this.pageIndex = 0;
    this.loadTransactions();
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
