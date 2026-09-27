import React, { useState, useEffect, useCallback } from 'react';
import { fetchTransactionById, retryTransaction, fetchAIExplanation } from '../../services/api';
import { ExecutionStepper } from './ExecutionStepper';
import { PayloadViewer } from './PayloadViewer';

const STATUS_STYLE = {
  Success:    { color: '#10b981', glow: 'rgba(16,185,129,0.4)',  bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
  Failed:     { color: '#ef4444', glow: 'rgba(239,68,68,0.5)',   bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)' },
  Processing: { color: '#f59e0b', glow: 'rgba(245,158,11,0.4)',  bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
};

/**
 * TransactionDetails — slide-in panel showing full transaction info, pipeline, payloads, error, and retry.
 * @param {{ txSummary: object, onClose: () => void, onRetrySuccess: (updated: object) => void }} props
 */
export function TransactionDetails({ txSummary, onClose, onRetrySuccess, onRetryProcessing }) {
  const [tx, setTx]               = useState(null);
  const [loading, setLoading]     = useState(true);
  const [retrying, setRetrying]   = useState(false);
  const [retryPhase, setRetryPhase] = useState(null); // 'processing' | 'success' | null
  const [retryError, setRetryError] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  /* Close with Escape */
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  /* Fetch full detail */
  const loadDetail = useCallback(async () => {
    setLoading(true);
    const result = await fetchTransactionById(txSummary.id);
    if (result.success) setTx(result.data);
    setLoading(false);
  }, [txSummary.id]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  /* Retry handler: Failed → Processing → Success */
  const handleRetry = async () => {
    if (!tx) return;
    setRetrying(true);
    setRetryError(null);
    setRetryPhase('processing');

    // Visually show Processing in both details and parent table
    setTx(prev => ({
      ...prev,
      status: 'Processing',
      executionSteps: prev.executionSteps ? prev.executionSteps.map(step =>
        step.name === 'Transformation'
          ? { ...step, status: 'processing', detail: 'Re-running schema transformation…' }
          : step
      ) : []
    }));
    if (onRetryProcessing) {
      onRetryProcessing(tx.id);
    }

    // Brief pause to show "Processing" state in UI
    await new Promise(r => setTimeout(r, 1200));

    const result = await retryTransaction(tx.id);

    if (result.success) {
      setTx(result.data);
      setRetryPhase('success');
      onRetrySuccess(result.data); // bubble up to parent to update list
      window.dispatchEvent(new CustomEvent('syncpulse:tx-updated', { detail: result.data }));
    } else {
      setRetryError(result.error || 'Retry failed.');
      setRetryPhase(null);
      setTx(prev => ({ ...prev, status: 'Failed' }));
    }
    setRetrying(false);
  };

  const handleExplainWithAI = async () => {
    if (!tx?.id) return;

    setAiLoading(true);
    setAiError(null);

    const result = await fetchAIExplanation(tx.id);

    if (result.success && result.data) {
      setAiResult(result.data);
    } else {
      setAiError(result.error || 'Unable to analyze this transaction right now.');
      setAiResult(null);
    }

    setAiLoading(false);
  };

  const displayTx = tx;
  const status    = displayTx?.status ?? txSummary.status;
  const s         = STATUS_STYLE[status] ?? STATUS_STYLE.Processing;

  return (
    <div className="details-overlay" onClick={onClose}>
      <div className="details-panel tx-details-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="details-header">
          <div className="details-header-left">
            <div
              className="details-status-dot"
              style={{ background: s.color, boxShadow: `0 0 10px ${s.glow}` }}
            />
            <div>
              <div className="tx-details-id">{txSummary.id}</div>
              <h2 className="details-title">{txSummary.type}</h2>
              <p className="details-subtitle">
                {txSummary.source} &rarr; {txSummary.target}
              </p>
            </div>
          </div>
          <button className="details-close-btn" onClick={onClose} title="Close (Esc)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="tx-detail-loading">
            <span className="spinner" />
            <span>Loading transaction…</span>
          </div>
        ) : !displayTx ? (
          <div className="tx-detail-loading">Failed to load transaction details.</div>
        ) : (
          <>
            {/* Status + meta bar */}
            <div className="details-meta-row">
              <span className="details-status-badge"
                style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                {status}
              </span>
              <div className="details-meta-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>{new Date(displayTx.timestamp).toLocaleString()}</span>
              </div>
              <div className="details-meta-chip">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                <span>Integration: <strong>{displayTx.integrationId}</strong></span>
              </div>
            </div>

            {/* Retry Phase Banner */}
            {retryPhase === 'processing' && (
              <div className="tx-retry-banner tx-retry-processing">
                <span className="spinner" />
                <span>Retrying transaction… <strong>Processing</strong></span>
              </div>
            )}
            {retryPhase === 'success' && (
              <div className="tx-retry-banner tx-retry-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Retry successful — transaction is now <strong>Success</strong></span>
              </div>
            )}
            {retryError && (
              <div className="tx-retry-banner tx-retry-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{retryError}</span>
              </div>
            )}

            {/* Error log */}
            {displayTx.errorMessage && (
              <div className="tx-error-log">
                <div className="tx-error-log-header">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>Transformation Failed</span>
                </div>
                <pre className="tx-error-log-msg">{displayTx.errorMessage}</pre>
              </div>
            )}

            {/* Execution pipeline */}
            <div className="details-pipeline-section">
              <h3 className="details-pipeline-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Execution Pipeline
              </h3>
              <ExecutionStepper steps={displayTx.executionSteps} />
            </div>

            {/* Payload viewers */}
            <div className="tx-payload-section">
              <h3 className="details-pipeline-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                Payload Inspector
              </h3>
              <PayloadViewer
                title="Source Payload"
                payload={displayTx.sourcePayload}
                emptyMessage="No source payload recorded."
              />
              <PayloadViewer
                title="Transformed Payload"
                payload={displayTx.transformedPayload}
                emptyMessage={displayTx.status === 'Failed' ? 'Transformation failed — no output generated.' : 'No transformed payload available.'}
              />
            </div>

            {/* Retry button */}
            {displayTx.status === 'Failed' && (
              <div className="tx-retry-section">
                <button
                  className="btn-retry"
                  onClick={handleRetry}
                  disabled={retrying}
                  id={`btn-retry-${displayTx.id}`}
                >
                  {retrying ? (
                    <><span className="spinner" />Retrying…</>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                      </svg>
                      Retry Transaction
                    </>
                  )}
                </button>

                <button
                  className="btn-ai-explain"
                  onClick={handleExplainWithAI}
                  disabled={aiLoading}
                  id={`btn-ai-${displayTx.id}`}
                >
                  {aiLoading ? (
                    <><span className="spinner" />Analyzing transaction...</>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z"/>
                        <path d="M12 8h.01"/>
                        <path d="M10 12h4"/>
                      </svg>
                      Explain with AI
                    </>
                  )}
                </button>

                <p className="tx-retry-hint">
                  Only available for <strong>Failed</strong> transactions. This will re-run the full pipeline.
                </p>
              </div>
            )}

            {displayTx.status === 'Failed' && (aiError || aiResult) && (
              <div className="tx-ai-panel">
                {aiError ? (
                  <div className="tx-ai-error">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <span>{aiError}</span>
                  </div>
                ) : aiResult ? (
                  <>
                    <div className="tx-ai-header">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                        <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Z"/>
                        <path d="M12 8h.01"/>
                        <path d="M10 12h4"/>
                      </svg>
                      <span>AI Copilot Analysis</span>
                    </div>

                    <div className="tx-ai-section">
                      <div className="tx-ai-label">Summary</div>
                      <div className="tx-ai-value">{aiResult.summary}</div>
                    </div>

                    <div className="tx-ai-section">
                      <div className="tx-ai-label">Root Cause</div>
                      <div className="tx-ai-value">{aiResult.rootCause}</div>
                    </div>

                    <div className="tx-ai-section">
                      <div className="tx-ai-label">Impact</div>
                      <div className="tx-ai-value">{aiResult.impact}</div>
                    </div>

                    <div className="tx-ai-section">
                      <div className="tx-ai-label">Recommended Fix</div>
                      <div className="tx-ai-value">{aiResult.recommendation}</div>
                    </div>

                    <div className="tx-ai-fix-grid">
                      <div className="tx-ai-fix-item">
                        <div className="tx-ai-label">Field</div>
                        <div className="tx-ai-value">{aiResult.suggestedFix?.field}</div>
                      </div>
                      <div className="tx-ai-fix-item">
                        <div className="tx-ai-label">Current Value</div>
                        <div className="tx-ai-value">{String(aiResult.suggestedFix?.currentValue)}</div>
                      </div>
                      <div className="tx-ai-fix-item">
                        <div className="tx-ai-label">Expected Type</div>
                        <div className="tx-ai-value">{aiResult.suggestedFix?.expectedType}</div>
                      </div>
                      <div className="tx-ai-fix-item">
                        <div className="tx-ai-label">Suggested Value</div>
                        <div className="tx-ai-value">{String(aiResult.suggestedFix?.suggestedValue)}</div>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
