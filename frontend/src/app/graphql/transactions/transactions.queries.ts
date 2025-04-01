import {gql} from '@apollo/client/core';

export const GET_BALANCE_QUERY = gql`
  query GetBalance {
    getBalance
  }
`;

export const GET_TRANSACTIONS_QUERY = gql`
  query GetTransactions($page: Float!, $pageSize: Float!, $type: String) {
    getTransactions(page: $page, pageSize: $pageSize, type: $type) {
      transactions {
        type
        amount
        timestamp
        updatedBalance
      }
      totalCount
    }
  }
`;
