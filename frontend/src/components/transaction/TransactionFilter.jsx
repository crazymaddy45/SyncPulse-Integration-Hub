import React from 'react';

const FILTERS = ['All', 'Success', 'Failed', 'Processing'];

const FILTER_STYLE = {
  All:        { active: '#6366f1', activeBg: 'rgba(99,102,241,0.15)',  activeBorder: 'rgba(99,102,241,0.4)' },
  Success:    { active: '#10b981', activeBg: 'rgba(16,185,129,0.12)',  activeBorder: 'rgba(16,185,129,0.35)' },
  Failed:     { active: '#ef4444', activeBg: 'rgba(239,68,68,0.12)',   activeBorder: 'rgba(239,68,68,0.35)' },
  Processing: { active: '#f59e0b', activeBg: 'rgba(245,158,11,0.12)',  activeBorder: 'rgba(245,158,11,0.35)' },
};

/**
 * TransactionFilter — status filter pill bar.
 * @param {{ active: string, counts: object, onChange: (f: string) => void }} props
 */
export function TransactionFilter({ active, counts, onChange }) {
  return (
    <div className="tx-filter-bar">
      {FILTERS.map(f => {
        const isActive = f === active;
        const s = FILTER_STYLE[f];
        const count = f === 'All' ? counts.all : (counts[f] ?? 0);

        return (
          <button
            key={f}
            className={`tx-filter-btn${isActive ? ' active' : ''}`}
            onClick={() => onChange(f)}
            style={isActive
              ? { color: s.active, background: s.activeBg, borderColor: s.activeBorder }
              : {}
            }
          >
            {f}
            <span
              className="tx-filter-count"
              style={isActive ? { background: s.active, color: '#fff' } : {}}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
