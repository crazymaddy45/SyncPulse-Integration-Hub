import React from 'react';

const STATUS_STYLE = {
  Success:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.28)',  dot: '#10b981' },
  Failed:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.28)',   dot: '#ef4444' },
  Processing: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.28)',  dot: '#f59e0b' },
};

const TYPE_ICONS = {
  'Order':          '#6366f1',
  'Purchase Order': '#8b5cf6',
  'Invoice':        '#ef4444',
  'Shipment':       '#06b6d4',
};

function formatTs(ts) {
  try {
    return new Date(ts).toLocaleTimeString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return ts; }
}

/**
 * TransactionRow — single table row for the transaction list.
 * @param {{ tx: object, onClick: () => void }} props
 */
export function TransactionRow({ tx, onClick }) {
  const s = STATUS_STYLE[tx.status] ?? STATUS_STYLE.Processing;
  const typeColor = TYPE_ICONS[tx.type] ?? '#9ca3af';

  return (
    <tr className="tx-row" onClick={onClick} id={`tx-row-${tx.id}`} tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {/* ID */}
      <td className="tx-cell tx-cell-id">
        <span className="tx-id-chip">{tx.id}</span>
      </td>

      {/* Type */}
      <td className="tx-cell">
        <span className="tx-type-chip" style={{ color: typeColor, borderColor: typeColor + '44', background: typeColor + '18' }}>
          {tx.type}
        </span>
      </td>

      {/* Source */}
      <td className="tx-cell tx-cell-sys">
        <span className="tx-sys-label tx-sys-src">{tx.source}</span>
      </td>

      {/* Target */}
      <td className="tx-cell tx-cell-sys">
        <span className="tx-sys-label tx-sys-dst">{tx.target}</span>
      </td>

      {/* Status */}
      <td className="tx-cell">
        <span
          className="tx-status-badge"
          style={{ color: s.color, background: s.bg, borderColor: s.border }}
        >
          <span className="tx-status-dot" style={{ background: s.dot, boxShadow: `0 0 6px ${s.dot}` }} />
          {tx.status}
        </span>
      </td>

      {/* Timestamp */}
      <td className="tx-cell tx-cell-ts">
        <span className="tx-ts">{formatTs(tx.timestamp)}</span>
      </td>

      {/* Chevron */}
      <td className="tx-cell tx-cell-action">
        <svg className="tx-row-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </td>
    </tr>
  );
}
