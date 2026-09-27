import React from 'react';
import { PipelineStep } from './PipelineStep';

const STATUS_META = {
  Active:  { color: '#10b981', glow: 'rgba(16,185,129,0.35)', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  Warning: { color: '#f59e0b', glow: 'rgba(245,158,11,0.35)',  bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)' },
  Error:   { color: '#ef4444', glow: 'rgba(239,68,68,0.35)',   bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)' },
};

/**
 * IntegrationDetails — slide-in panel showing full integration info and pipeline.
 * @param {{ integration: object, onClose: () => void }} props
 */
export function IntegrationDetails({ integration, onClose }) {
  const meta = STATUS_META[integration.status] ?? STATUS_META.Active;

  return (
    <div className="details-overlay" onClick={onClose}>
      <div className="details-panel" onClick={(e) => e.stopPropagation()}>

        {/* Panel Header */}
        <div className="details-header">
          <div className="details-header-left">
            <div
              className="details-status-dot"
              style={{ background: meta.color, boxShadow: `0 0 10px ${meta.glow}` }}
            />
            <div>
              <h2 className="details-title">{integration.name}</h2>
              <p className="details-subtitle">Integration Pipeline Visualization</p>
            </div>
          </div>
          <button className="details-close-btn" onClick={onClose} title="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Meta row */}
        <div className="details-meta-row">
          <div className="details-meta-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Last sync: <strong>{integration.last_sync || 'N/A'}</strong></span>
          </div>
          <div className="details-meta-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            <span>Source: <strong>{integration.source}</strong></span>
          </div>
          <div className="details-meta-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><polyline points="5 12 12 5 19 12"/><polyline points="5 19 12 12 19 19"/></svg>
            <span>Destination: <strong>{integration.destination}</strong></span>
          </div>
          <span
            className="details-status-badge"
            style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}
          >
            {integration.status}
          </span>
        </div>

        {/* Description */}
        <p className="details-description">{integration.description}</p>

        {/* Error alert */}
        {integration.error_details && (
          <div className="details-error-alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{integration.error_details}</span>
          </div>
        )}

        {/* Pipeline */}
        <div className="details-pipeline-section">
          <h3 className="details-pipeline-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Pipeline Execution Flow
          </h3>

          <div className="details-pipeline">
            {integration.pipeline.map((step, idx) => (
              <PipelineStep
                key={step.id}
                step={step}
                isLast={idx === integration.pipeline.length - 1}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
