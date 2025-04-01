import {gql} from '@apollo/client/core';

export const DEPOSIT_MUTATION = gql`
  mutation Deposit($input: TransactionInput!) {
    deposit(input: $input)
  }
`;

export const WITHDRAW_MUTATION = gql`
  mutation Withdraw($input: TransactionInput!) {
    withdraw(input: $input)
  }
`;
