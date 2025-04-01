import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {DEPOSIT_MUTATION, WITHDRAW_MUTATION} from '../graphql/transactions/transactions.mutations';
import {GET_BALANCE_QUERY, GET_TRANSACTIONS_QUERY} from '../graphql/transactions/transactions.queries';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private apollo: Apollo) {}

  deposit(amount: number): Observable<number> {
    return this.apollo.mutate({
      mutation: DEPOSIT_MUTATION,
      variables: {
        input: { amount },
      },
    }).pipe(
      map(({ data }: any) => data.deposit),
      catchError((error) => {
        console.error('Deposit failed:', error);
        return throwError(() => error);
      }),
    );
  }

  withdraw(amount: number): Observable<number> {
    return this.apollo.mutate({
      mutation: WITHDRAW_MUTATION,
      variables: {
        input: { amount },
      },
    }).pipe(
      map(({ data }: any) => data.withdraw),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  getBalance(): Observable<number> {
    return this.apollo.query({
      query: GET_BALANCE_QUERY,
      fetchPolicy: 'network-only',
    }).pipe(
      map(({ data }: any) => data.getBalance),
      catchError((error) => {
        console.error('Failed to fetch balance:', error);
        return throwError(() => error);
      }),
    );
  }

  getTransactions(page: number, pageSize: number, type: string): Observable<any> {
    const filter = type === 'All' ? null : type;
    return this.apollo.watchQuery({
      query: GET_TRANSACTIONS_QUERY,
      variables: { page, pageSize, type: filter },
      fetchPolicy: 'network-only',
    }).valueChanges.pipe(
      map(({ data }: any) => data.getTransactions),
      catchError((error) => {
        console.error('Failed to fetch transactions:', error);
        return throwError(() => error);
      }),
    );
  }
}
