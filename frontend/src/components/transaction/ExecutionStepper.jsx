import React from 'react';

const STEP_STYLE = {
  completed:  { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.28)', label: 'Done' },
  failed:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.28)',  label: 'Failed' },
  skipped:    { color: '#6b7280', bg: 'rgba(107,114,128,0.10)', border: 'rgba(107,114,128,0.22)', label: 'Skipped' },
  processing: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)', label: 'Running' },
  pending:    { color: '#4b5563', bg: 'rgba(75,85,99,0.08)',   border: 'rgba(75,85,99,0.18)',   label: 'Pending' },
};

const STEP_ICONS = {
  completed: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  failed: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  skipped: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  processing: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin-icon">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
  ),
  pending: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  ),
};

/**
 * ExecutionStepper — renders the pipeline steps for a transaction.
 * @param {{ steps: Array }} props
 */
export function ExecutionStepper({ steps }) {
  return (
    <div className="exec-stepper">
      {steps.map((step, idx) => {
        const style = STEP_STYLE[step.status] ?? STEP_STYLE.pending;
        const icon  = STEP_ICONS[step.status]  ?? STEP_ICONS.pending;
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.id} className="exec-step-wrapper">
            <div
              className="exec-step"
              style={{ background: style.bg, borderColor: style.border }}
            >
              {/* Step number circle */}
              <div className="exec-step-num" style={{ color: style.color, borderColor: style.border }}>
                {step.id}
              </div>

              {/* Step body */}
              <div className="exec-step-body">
                <span className="exec-step-name">{step.name}</span>
                {step.detail && (
                  <span className="exec-step-detail">{step.detail}</span>
                )}
              </div>

              {/* Status badge */}
              <span
                className="exec-step-badge"
                style={{ color: style.color, background: style.bg, borderColor: style.border }}
              >
                <span style={{ color: style.color }}>{icon}</span>
                {style.label}
              </span>
            </div>

            {!isLast && (
              <div className="exec-connector">
                <div className="exec-connector-line" />
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="exec-connector-arrow">
                  <path d="M1 1L6 7L11 1" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
