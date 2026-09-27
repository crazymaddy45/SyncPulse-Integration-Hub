import React, { useEffect, useState } from 'react';
import { fetchMonitoringOverview } from '../../services/api';

const CARD_STYLE = {
  healthy: { color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  warning: { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  error: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
};

function StatTile({ label, value, tone }) {
  const style = CARD_STYLE[tone] || CARD_STYLE.healthy;
  return (
    <div style={{
      flex: 1,
      minWidth: '120px',
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: '12px',
      padding: '0.9rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem',
    }}>
      <div style={{ fontSize: '0.74rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#cbd5e1' }}>{label}</div>
      <div style={{ fontSize: '1.55rem', fontWeight: 800, color: style.color }}>{value}</div>
    </div>
  );
}

export function MonitoringCenter() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOverview = async () => {
    setLoading(true);
    setError('');
    const result = await fetchMonitoringOverview();
    if (result.success) {
      setOverview(result.data);
    } else {
      setError(result.error || 'Unable to load monitoring data.');
      setOverview(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const integrationHealth = overview?.integrationHealth || { healthy: 0, warning: 0, error: 0 };
  const transactionHealth = overview?.transactionHealth || { successful: 0, failed: 0, processing: 0 };
  const alerts = overview?.alerts || [];
  const recentEvents = overview?.recentEvents || [];

  return (
    <section className="explorer-section" id="monitoring-center">
      <div className="explorer-header">
        <div className="explorer-title-group">
          <div className="explorer-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v10" />
              <path d="M12 18v4" />
              <path d="M4.93 4.93l7.07 7.07" />
              <path d="M19.07 19.07l-7.07-7.07" />
              <circle cx="12" cy="12" r="8" />
            </svg>
          </div>
          <div>
            <h2 className="explorer-title">Monitoring Center</h2>
            <p className="explorer-subtitle">Live health / alert view from GET /api/monitoring/overview</p>
          </div>
        </div>

        <button className="btn-refresh btn-sm" onClick={loadOverview} disabled={loading}>
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="explorer-body" style={{ padding: '1.5rem' }}>
        {loading && (
          <div className="explorer-placeholder">
            <div className="skeleton-row" />
          </div>
        )}

        {!loading && error && (
          <div className="explorer-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Unable to load monitoring data.</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && overview && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.8rem' }}>
                Integration Health
              </div>
              <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                <StatTile label="Healthy" value={integrationHealth.healthy} tone="healthy" />
                <StatTile label="Warning" value={integrationHealth.warning} tone="warning" />
                <StatTile label="Error" value={integrationHealth.error} tone="error" />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.8rem' }}>
                Transaction Health
              </div>
              <div style={{ display: 'flex', gap: '0.9rem', flexWrap: 'wrap' }}>
                <StatTile label="Successful" value={transactionHealth.successful} tone="healthy" />
                <StatTile label="Failed" value={transactionHealth.failed} tone="error" />
                <StatTile label="Processing" value={transactionHealth.processing} tone="warning" />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem 1.15rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc' }}>Active Alerts</h3>
              </div>

              {alerts.length === 0 ? (
                <div style={{ color: '#cbd5e1', padding: '0.5rem 0' }}>No active transaction alerts.</div>
              ) : (
                alerts.map(alert => (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('syncpulse:monitor-alert-click', { detail: { id: alert.id } }))}
                    style={{
                      width: '100%',
                      display: 'block',
                      background: 'rgba(239,68,68,0.08)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#f9fafb',
                      borderRadius: '10px',
                      padding: '0.9rem 1rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '0.3rem' }}>{alert.type}</div>
                    <div style={{ fontSize: '0.82rem', color: '#e2e8f0', marginBottom: '0.2rem' }}>{alert.id}</div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{alert.message}</div>
                  </button>
                ))
              )}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem 1.15rem' }}>
              <div style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.8rem' }}>
                Recent Events
              </div>

              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {recentEvents.map(event => {
                  const statusColor = event.status === 'Success' ? '#34d399' : event.status === 'Failed' ? '#f87171' : '#fbbf24';
                  const prefix = event.status === 'Success' ? '🟢' : event.status === 'Failed' ? '🔴' : '🟡';

                  return (
                    <div key={`${event.id}-${event.message}`} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#e2e8f0', padding: '0.4rem 0' }}>
                      <span>{prefix}</span>
                      <span style={{ color: statusColor, fontWeight: 700 }}>{event.id}</span>
                      <span>— {event.message}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
