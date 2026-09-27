import React from 'react';

/**
 * MetricCard — displays a single operational metric with an icon, large value,
 * title, short description, and dedicated theme glow/color styling.
 *
 * @param {{
 *   title: string,
 *   value: number | string,
 *   description: string,
 *   type: 'active' | 'processed' | 'success' | 'failed' | 'processing',
 *   icon: React.ReactNode,
 *   badgeText?: string
 * }} props
 */
export function MetricCard({ title, value, description, type, icon, badgeText }) {
  return (
    <div className={`metric-card metric-card-${type}`}>
      <div className="metric-card-header">
        <div className="metric-icon-wrapper">
          {icon}
        </div>
        {badgeText && (
          <span className="metric-badge">
            {badgeText}
          </span>
        )}
      </div>

      <div className="metric-body">
        <div className="metric-value-row">
          <span className="metric-value">{value}</span>
        </div>
        <h3 className="metric-title">{title}</h3>
        <p className="metric-description">{description}</p>
      </div>

      <div className="metric-accent-line" />
    </div>
  );
}
