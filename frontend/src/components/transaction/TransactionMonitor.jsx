import React, { useState, useEffect, useCallback } from 'react';
import { fetchTransactions } from '../../services/api';
import { TransactionFilter } from './TransactionFilter';
import { TransactionTable } from './TransactionTable';
import { TransactionDetails } from './TransactionDetails';

/**
 * TransactionMonitor — Module 2 root.
 * Fetches all transactions, applies status filter, manages detail view and retry state.
 */
export function TransactionMonitor({ onTransactionUpdated }) {
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [activeFilter, setActiveFilter]   = useState('All');
  const [selectedTx, setSelectedTx]       = useState(null);

  /* Load all transactions */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchTransactions();
    if (result.success) {
      setTransactions(result.data);
    } else {
      setError(result.error || 'Failed to load transactions.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Filter logic */
  const filtered = activeFilter === 'All'
    ? transactions
    : transactions.filter(t => t.status === activeFilter);

  /* Counts for filter pill badges */
  const counts = {
    all:        transactions.length,
    Success:    transactions.filter(t => t.status === 'Success').length,
    Failed:     transactions.filter(t => t.status === 'Failed').length,
    Processing: transactions.filter(t => t.status === 'Processing').length,
  };

  /* When a retry begins, mark transaction as Processing in the list */
  const handleRetryProcessing = (txId) => {
    setTransactions(prev =>
      prev.map(t => t.id === txId
        ? { ...t, status: 'Processing' }
        : t
      )
    );
  };

  /* When a retry succeeds, update the transaction in the list */
  const handleRetrySuccess = (updatedTx) => {
    setTransactions(prev =>
      prev.map(t => t.id === updatedTx.id
        ? { ...t, ...updatedTx }
        : t
      )
    );
    if (onTransactionUpdated) {
      onTransactionUpdated(updatedTx);
    }
  };

  return (
    <section className="explorer-section" id="transaction-monitor">

      {/* Section header */}
      <div className="explorer-header">
        <div className="explorer-title-group">
          <div className="explorer-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </div>
          <div>
            <h2 className="explorer-title">Transaction Monitor</h2>
            <p className="explorer-subtitle">Module 2 — Live transaction log from <code>GET /api/transactions</code></p>
          </div>
        </div>

        <div className="explorer-stats">
          {!loading && (
            <>
              <span className="stat-chip stat-total">{counts.all} Total</span>
              {counts.Success    > 0 && <span className="stat-chip stat-active">{counts.Success} Success</span>}
              {counts.Processing > 0 && <span className="stat-chip stat-warning">{counts.Processing} Processing</span>}
              {counts.Failed     > 0 && <span className="stat-chip stat-error">{counts.Failed} Failed</span>}
            </>
          )}
          <button className="btn-refresh btn-sm" onClick={load} disabled={loading}>
            {loading
              ? <span className="spinner" />
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            }
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Body card */}
      <div className="explorer-body">
        {/* Filter bar */}
        <div className="tx-filter-row">
          <TransactionFilter
            active={activeFilter}
            counts={counts}
            onChange={setActiveFilter}
          />
        </div>

        {/* Table */}
        {loading && (
          <div className="explorer-placeholder">
            {[1, 2, 3, 4].map(n => <div key={n} className="skeleton-row" />)}
          </div>
        )}

        {!loading && error && (
          <div className="explorer-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Failed to load transactions</strong>
              <p>{error}</p>
            </div>
            <button className="btn-refresh btn-sm" onClick={load}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <TransactionTable
            transactions={filtered}
            onSelectTx={setSelectedTx}
          />
        )}
      </div>

      {/* Details side panel */}
      {selectedTx && (
        <TransactionDetails
          txSummary={selectedTx}
          onClose={() => setSelectedTx(null)}
          onRetrySuccess={handleRetrySuccess}
          onRetryProcessing={handleRetryProcessing}
        />
      )}
    </section>
  );
}
