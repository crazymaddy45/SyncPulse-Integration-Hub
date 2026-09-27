import React from 'react';

const STATUS_CONFIG = {
  completed: {
    iconColor: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    label: 'Completed',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  failed: {
    iconColor: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    label: 'Failed',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
  skipped: {
    iconColor: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.10)',
    borderColor: 'rgba(107, 114, 128, 0.25)',
    label: 'Skipped',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  pending: {
    iconColor: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.08)',
    borderColor: 'rgba(156, 163, 175, 0.2)',
    label: 'Pending',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
};

/**
 * PipelineStep — renders one node in the pipeline visualization.
 * @param {{ step: object, isLast: boolean }} props
 */
export function PipelineStep({ step, isLast }) {
  const cfg = STATUS_CONFIG[step.status] ?? STATUS_CONFIG.pending;

  return (
    <div className="pipeline-step-wrapper">
      <div
        className="pipeline-step"
        style={{
          background: cfg.bgColor,
          borderColor: cfg.borderColor,
        }}
      >
        <div
          className="pipeline-step-icon"
          style={{ color: cfg.iconColor, background: cfg.bgColor, borderColor: cfg.borderColor }}
        >
          {cfg.icon}
        </div>

        <div className="pipeline-step-body">
          <span className="pipeline-step-name">{step.name}</span>
          {step.details && (
            <span className="pipeline-step-detail">{step.details}</span>
          )}
        </div>

        <span
          className="pipeline-step-badge"
          style={{ color: cfg.iconColor, background: cfg.bgColor, borderColor: cfg.borderColor }}
        >
          {cfg.label}
        </span>
      </div>

      {!isLast && (
        <div className="pipeline-connector">
          <div className="pipeline-connector-line" />
          <svg className="pipeline-connector-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      )}
    </div>
  );
}
