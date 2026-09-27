import React, { useState, useEffect, useCallback } from 'react';
import { fetchIntegrations } from '../../services/api';
import { IntegrationCard } from './IntegrationCard';
import { IntegrationDetails } from './IntegrationDetails';

/**
 * IntegrationExplorer — Module 1 root page.
 * Fetches integrations from GET /api/integrations, renders list, and manages detail view.
 */
export function IntegrationExplorer() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selected, setSelected]         = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchIntegrations();
    if (result.success) {
      setIntegrations(result.data);
    } else {
      setError(result.error || 'Failed to load integrations.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Close detail panel with Escape */
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const activeCount  = integrations.filter(i => i.status === 'Active').length;
  const errorCount   = integrations.filter(i => i.status === 'Error').length;
  const warningCount = integrations.filter(i => i.status === 'Warning').length;

  return (
    <section className="explorer-section" id="integration-explorer">
      {/* Section header */}
      <div className="explorer-header">
        <div className="explorer-title-group">
          <div className="explorer-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <h2 className="explorer-title">Integration Explorer</h2>
            <p className="explorer-subtitle">Module 1 — Live integration registry from <code>GET /api/integrations</code></p>
          </div>
        </div>

        <div className="explorer-stats">
          {!loading && (
            <>
              <span className="stat-chip stat-total">{integrations.length} Total</span>
              {activeCount  > 0 && <span className="stat-chip stat-active">{activeCount} Active</span>}
              {warningCount > 0 && <span className="stat-chip stat-warning">{warningCount} Warning</span>}
              {errorCount   > 0 && <span className="stat-chip stat-error">{errorCount} Error</span>}
            </>
          )}
          <button className="btn-refresh btn-sm" onClick={load} disabled={loading} title="Reload integrations">
            {loading
              ? <span className="spinner" />
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            }
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="explorer-body">
        {loading && (
          <div className="explorer-placeholder">
            {[1, 2, 3, 4].map(n => <div key={n} className="skeleton-row" />)}
          </div>
        )}

        {!loading && error && (
          <div className="explorer-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Failed to load integrations</strong>
              <p>{error}</p>
            </div>
            <button className="btn-refresh btn-sm" onClick={load}>Retry</button>
          </div>
        )}

        {!loading && !error && integrations.length === 0 && (
          <div className="explorer-empty">No integrations found.</div>
        )}

        {!loading && !error && integrations.length > 0 && (
          <div className="intg-list">
            {integrations.map(intg => (
              <IntegrationCard
                key={intg.id}
                integration={intg}
                onClick={() => setSelected(intg)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail panel overlay */}
      {selected && (
        <IntegrationDetails
          integration={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
