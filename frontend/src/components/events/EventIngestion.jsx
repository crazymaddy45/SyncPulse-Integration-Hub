import React, { useState } from 'react';
import { sendEvent } from '../../services/api';

const initialForm = {
  source: 'Supplier Portal',
  target: 'SAP ERP',
  type: 'Invoice',
  invoiceId: 'INV-5005',
  product: 'Monitor',
  quantity: '2',
  unitPrice: '25000',
};

export function EventIngestion({ onViewTransactions }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const payload = {
      type: form.type,
      source: form.source,
      target: form.target,
      payload: {
        invoiceId: form.invoiceId,
        product: form.product,
        quantity: Number(form.quantity),
        unitPrice: Number(form.unitPrice),
      },
    };

    const response = await sendEvent(payload);

    if (!response.success) {
      setError(response.error || 'Unable to process the incoming event.');
      setLoading(false);
      return;
    }

    setResult(response.data);
    setLoading(false);
  };

  return (
    <section className="explorer-section" id="event-ingestion">
      <div className="explorer-header">
        <div className="explorer-title-group">
          <div className="explorer-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h16" />
              <path d="M12 4v16" />
              <path d="M5 5l14 14" />
            </svg>
          </div>
          <div>
            <h2 className="explorer-title">Real-Time Event Ingestion</h2>
            <p className="explorer-subtitle">Module 7 — Send a live business event into the in-memory transaction flow</p>
          </div>
        </div>
      </div>

      <div className="explorer-body" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0', fontWeight: 600 }}>
              Source
              <input
                name="source"
                value={form.source}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.7)', color: '#f8fafc' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0', fontWeight: 600 }}>
              Target
              <input
                name="target"
                value={form.target}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.7)', color: '#f8fafc' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0', fontWeight: 600 }}>
              Transaction Type
              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.7)', color: '#f8fafc' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0', fontWeight: 600 }}>
              Invoice ID
              <input
                name="invoiceId"
                value={form.invoiceId}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.7)', color: '#f8fafc' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0', fontWeight: 600 }}>
              Product
              <input
                name="product"
                value={form.product}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.7)', color: '#f8fafc' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0', fontWeight: 600 }}>
              Quantity
              <input
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.7)', color: '#f8fafc' }}
              />
            </label>

            <label style={{ display: 'grid', gap: '0.45rem', color: '#e2e8f0', fontWeight: 600 }}>
              Unit Price
              <input
                name="unitPrice"
                type="number"
                value={form.unitPrice}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.7rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15,23,42,0.7)', color: '#f8fafc' }}
              />
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
            <button type="submit" className="btn-refresh btn-sm" disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Sending...' : 'Send Event'}
            </button>
          </div>
        </form>

        {error && (
          <div className="explorer-error" style={{ marginTop: '1rem' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Event ingestion failed</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {result && (
          <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.35)', background: 'rgba(16,185,129,0.12)', color: '#dcfce7' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 }}>
              Event processed successfully
            </div>
            <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.4rem' }}>
              <div><strong>Transaction ID:</strong> {result.id}</div>
              <div><strong>Status:</strong> {result.status}</div>
            </div>
            {onViewTransactions && (
              <div style={{ marginTop: '1rem' }}>
                <button className="btn-refresh btn-sm" onClick={onViewTransactions} type="button">
                  View Transactions
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
