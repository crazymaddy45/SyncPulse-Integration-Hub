import React, { useState } from 'react';

/**
 * PayloadViewer — collapsible JSON block with syntax coloring.
 * @param {{ title: string, payload: object|null, emptyMessage?: string }} props
 */
export function PayloadViewer({ title, payload, emptyMessage = 'No payload available.' }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="payload-viewer">
      <button
        className="payload-viewer-header"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="payload-viewer-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
            <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
          </svg>
          {title}
        </div>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"
          style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {!collapsed && (
        <div className="payload-viewer-body">
          {payload == null ? (
            <span className="payload-empty">{emptyMessage}</span>
          ) : (
            <pre className="payload-json">
              <code>{JSON.stringify(payload, null, 2)}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
