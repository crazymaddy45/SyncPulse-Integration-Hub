import React, { useState, useEffect, useCallback } from 'react';
import { fetchDashboardMetrics } from '../../services/api';
import { MetricCard } from './MetricCard';

/**
 * Dashboard — Module 3: Hub Metrics Dashboard.
 * Displays operational high-level metrics calculated directly from the backend:
 * 1. Active Integrations
 * 2. Processed Transactions
 * 3. Successful Transactions
 * 4. Failed Transactions
 * 5. Processing / In-Flight Transactions
 *
 * @param {{ refreshTrigger?: any }} props
 */
export function Dashboard({ refreshTrigger }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchDashboardMetrics();
    if (result.success && result.data) {
      setMetrics(result.data);
      setLastUpdated(new Date());
    } else {
      setError(result.error || 'Failed to fetch hub metrics');
    }
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Refetch when external trigger changes (e.g., when a transaction is retried)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger !== null) {
      loadMetrics();
    }
  }, [refreshTrigger, loadMetrics]);

  // Also listen for window custom event for real-time synchronization
  useEffect(() => {
    const handleTxUpdate = () => {
      loadMetrics();
    };
    window.addEventListener('syncpulse:tx-updated', handleTxUpdate);
    return () => window.removeEventListener('syncpulse:tx-updated', handleTxUpdate);
  }, [loadMetrics]);

  return (
    <section className="dashboard-section" id="hub-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-group">
          <div className="dashboard-icon-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1.5" />
              <rect x="14" y="3" width="7" height="5" rx="1.5" />
              <rect x="14" y="12" width="7" height="9" rx="1.5" />
              <rect x="3" y="16" width="7" height="5" rx="1.5" />
            </svg>
          </div>
          <div>
            <h2 className="dashboard-title">Hub Metrics Dashboard</h2>
            <p className="dashboard-subtitle">
              Module 3 — Real-time operational health overview calculated from <code>GET /api/dashboard/metrics</code>
            </p>
          </div>
        </div>

        <div className="dashboard-actions">
          {lastUpdated && !loading && (
            <span className="dashboard-updated-label">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            className="btn-refresh btn-sm"
            onClick={loadMetrics}
            disabled={loading}
            id="btn-refresh-dashboard"
            title="Refresh metrics from backend"
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            )}
            {loading ? 'Refreshing…' : 'Refresh Metrics'}
          </button>
        </div>
      </div>

      {error && (
        <div className="dashboard-error-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div className="dashboard-error-text">
            <strong>Unable to load dashboard metrics:</strong> {error}
          </div>
          <button className="btn-refresh btn-sm" onClick={loadMetrics}>Retry</button>
        </div>
      )}

      <div className="metrics-grid">
        {/* Card 1: Active Integrations */}
        <MetricCard
          title="Active Integrations"
          value={loading && !metrics ? '—' : (metrics?.activeIntegrations ?? 0)}
          description="Active connections"
          type="active"
          badgeText="Operational"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          }
        />

        {/* Card 2: Processed Transactions */}
        <MetricCard
          title="Processed Transactions"
          value={loading && !metrics ? '—' : (metrics?.processedTransactions ?? 0)}
          description="Total transactions"
          type="processed"
          badgeText="Total"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          }
        />

        {/* Card 3: Successful Transactions */}
        <MetricCard
          title="Successful"
          value={loading && !metrics ? '—' : (metrics?.successfulTransactions ?? 0)}
          description="Successful transactions"
          type="success"
          badgeText="Delivered"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />

        {/* Card 4: Failed Transactions */}
        <MetricCard
          title="Failed"
          value={loading && !metrics ? '—' : (metrics?.failedTransactions ?? 0)}
          description="Failed transactions"
          type="failed"
          badgeText={metrics?.failedTransactions > 0 ? 'Action Required' : 'All Clear'}
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          }
        />

        {/* Card 5: Processing / In-Flight */}
        <MetricCard
          title="Processing"
          value={loading && !metrics ? '—' : (metrics?.processingTransactions ?? 0)}
          description="Currently in-flight"
          type="processing"
          badgeText="In-Flight"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={metrics?.processingTransactions > 0 ? "spin-icon" : ""}>
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          }
        />
      </div>
    </section>
  );
}
