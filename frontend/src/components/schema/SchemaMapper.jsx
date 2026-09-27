import React, { useMemo, useState } from 'react';
import { fetchSchemaMapping } from '../../services/api';

const DEFAULT_SOURCE_SYSTEM = 'Supplier Portal';
const DEFAULT_TARGET_SYSTEM = 'SAP ERP';

const DEFAULT_SOURCE_SCHEMA = {
  invoiceId: 'string',
  product: 'string',
  quantity: 'number',
  unitPrice: 'number',
};

const DEFAULT_TARGET_SCHEMA = {
  invoiceNumber: 'string',
  material: 'string',
  quantity: 'number',
  unitPrice: 'number',
};

export function SchemaMapper() {
  const [sourceSystem] = useState(DEFAULT_SOURCE_SYSTEM);
  const [targetSystem] = useState(DEFAULT_TARGET_SYSTEM);
  const [sourceSchema] = useState(DEFAULT_SOURCE_SCHEMA);
  const [targetSchema] = useState(DEFAULT_TARGET_SCHEMA);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);

  const sourceEntries = useMemo(() => Object.entries(sourceSchema), [sourceSchema]);
  const targetEntries = useMemo(() => Object.entries(targetSchema), [targetSchema]);

  const handleSuggest = async () => {
    setLoading(true);
    setError('');
    setApplied(false);

    const result = await fetchSchemaMapping(sourceSystem, targetSystem, sourceSchema, targetSchema);

    if (!result.success) {
      setLoading(false);
      setError(result.error || 'Unable to generate schema mappings.');
      setMappings([]);
      return;
    }

    const data = result.data || {};
    const suggestedMappings = Array.isArray(data.mappings) ? data.mappings : [];

    setMappings(suggestedMappings);
    setLoading(false);
  };

  const handleApplyMapping = () => {
    setApplied(true);
  };

  return (
    <section className="explorer-section" id="schema-mapper">
      <div className="explorer-header">
        <div className="explorer-title-group">
          <div className="explorer-icon" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h10" />
              <circle cx="18" cy="17" r="3" />
            </svg>
          </div>
          <div>
            <h2 className="explorer-title">Schema Mapping</h2>
            <p className="explorer-subtitle">Module 5 — AI-assisted schema mapping prototype</p>
          </div>
        </div>

        <button className="btn-refresh btn-sm" onClick={handleSuggest} disabled={loading}>
          {loading ? <span className="spinner" /> : null}
          {loading ? 'Analyzing schemas...' : 'Suggest Mapping with AI'}
        </button>
      </div>

      <div className="explorer-body" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.75rem' }}>
              Source System
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{sourceSystem}</div>
            <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
              {sourceEntries.map(([field, type]) => (
                <div key={field} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', background: 'rgba(0,0,0,0.12)', padding: '0.55rem 0.7rem', borderRadius: '8px' }}>
                  <span style={{ color: '#dbeafe', fontFamily: 'var(--font-mono)' }}>{field}</span>
                  <span style={{ color: '#94a3b8' }}>{type}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '0.75rem' }}>
              Target System
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{targetSystem}</div>
            <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
              {targetEntries.map(([field, type]) => (
                <div key={field} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', background: 'rgba(0,0,0,0.12)', padding: '0.55rem 0.7rem', borderRadius: '8px' }}>
                  <span style={{ color: '#dbeafe', fontFamily: 'var(--font-mono)' }}>{field}</span>
                  <span style={{ color: '#94a3b8' }}>{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {loading && (
          <div className="explorer-placeholder" style={{ marginTop: '0.5rem' }}>
            <div className="skeleton-row" />
          </div>
        )}

        {!loading && error && (
          <div className="explorer-error" style={{ marginTop: '0.75rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Schema mapping unavailable</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {!loading && mappings.length > 0 && (
          <div style={{ marginTop: '1.25rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, color: '#f8fafc' }}>
              AI Schema Mapping
            </div>

            <div style={{ padding: '1rem 1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#94a3b8', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Source Field</th>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Target Field</th>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Confidence</th>
                    <th style={{ padding: '0.65rem 0.5rem', fontWeight: 600 }}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((entry, index) => (
                    <tr key={`${entry.sourceField}-${index}`} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#dbeafe', fontFamily: 'var(--font-mono)' }}>{entry.sourceField}</td>
                      <td style={{ padding: '0.7rem 0.5rem', color: entry.targetField === 'unmapped' ? '#fbbf24' : '#67e8f9', fontWeight: 600 }}>
                        {entry.targetField === 'unmapped' ? 'Manual mapping required' : entry.targetField}
                      </td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#f8fafc' }}>
                        {entry.confidence >= 0.99 ? '100%' : `${Math.round(entry.confidence * 100)}%`}
                      </td>
                      <td style={{ padding: '0.7rem 0.5rem', color: '#cbd5e1', lineHeight: 1.5 }}>{entry.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>
                AI suggestions should be reviewed before applying.
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-refresh btn-sm" onClick={handleApplyMapping}>
                  Apply Mapping
                </button>
              </div>

              {applied && (
                <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#bbf7d0', fontWeight: 600 }}>
                  Schema mapping applied successfully.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
