import React from 'react';

const STATUS_META = {
  Active:  { color: '#10b981', glow: 'rgba(16,185,129,0.4)',  bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  dot: '#10b981' },
  Warning: { color: '#f59e0b', glow: 'rgba(245,158,11,0.4)',  bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  dot: '#f59e0b' },
  Error:   { color: '#ef4444', glow: 'rgba(239,68,68,0.4)',   bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   dot: '#ef4444' },
};

/**
 * IntegrationCard — row-style card for the Integration Explorer list.
 * @param {{ integration: object, onClick: () => void }} props
 */
export function IntegrationCard({ integration, onClick }) {
  const meta = STATUS_META[integration.status] ?? STATUS_META.Active;

  return (
    <button className="intg-card" onClick={onClick} id={`intg-card-${integration.id}`}>

      {/* Left: status dot */}
      <div className="intg-card-dot-col">
        <div
          className="intg-card-dot"
          style={{
            background: meta.dot,
            boxShadow: `0 0 8px ${meta.glow}`,
          }}
        />
        {integration.status === 'Active' && (
          <div className="intg-card-dot-ring" style={{ borderColor: meta.dot }} />
        )}
      </div>

      {/* Center: name + systems + description */}
      <div className="intg-card-body">
        <div className="intg-card-name">{integration.name}</div>
        <div className="intg-card-systems">
          <span className="intg-system-chip intg-system-src">{integration.source}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
          <span className="intg-system-chip intg-system-dst">{integration.destination}</span>
        </div>
        <p className="intg-card-desc">{integration.description}</p>
      </div>

      {/* Right: status badge + chevron */}
      <div className="intg-card-right">
        <span
          className="intg-status-badge"
          style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
        >
          {integration.status}
        </span>
        <svg className="intg-card-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </button>
  );
}
