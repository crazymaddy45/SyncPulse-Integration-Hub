import React from 'react';
import { TransactionRow } from './TransactionRow';

/**
 * TransactionTable — renders the transactions in a styled table.
 * @param {{ transactions: Array, onSelectTx: (tx) => void }} props
 */
export function TransactionTable({ transactions, onSelectTx }) {
  if (transactions.length === 0) {
    return (
      <div className="tx-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <p>No transactions match the selected filter.</p>
      </div>
    );
  }

  return (
    <div className="tx-table-wrapper">
      <table className="tx-table">
        <thead>
          <tr className="tx-thead-row">
            <th className="tx-th">Transaction ID</th>
            <th className="tx-th">Type</th>
            <th className="tx-th">Source</th>
            <th className="tx-th">Target</th>
            <th className="tx-th">Status</th>
            <th className="tx-th">Timestamp</th>
            <th className="tx-th"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              onClick={() => onSelectTx(tx)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
