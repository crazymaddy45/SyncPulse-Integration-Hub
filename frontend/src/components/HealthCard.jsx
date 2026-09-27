import React, { useState, useEffect } from 'react';
import { fetchHealthStatus } from '../services/api';

export function HealthCard() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState('');

  const checkHealth = async () => {
    setLoading(true);
    const result = await fetchHealthStatus();
    setHealthData(result);
    setLoading(false);
    setLastCheck(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const isConnected = healthData?.success && healthData?.data?.status === 'success';

  return (
    <div className="health-card">
      <div className="health-card-header">
        <div className="title-group">
          <div className="icon-pulse">
            <div className={`status-indicator ${isConnected ? 'online' : 'offline'}`} />
          </div>
          <div>
            <h3>API Health Status</h3>
            <p className="endpoint-text">GET /api/health</p>
          </div>
        </div>
        
        <button 
          onClick={checkHealth} 
          disabled={loading}
          className="btn-refresh"
          title="Re-check health status"
        >
          {loading ? (
            <span className="spinner"></span>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
          )}
          <span>{loading ? 'Checking...' : 'Check Status'}</span>
        </button>
      </div>

      <div className="health-card-body">
        <div className="status-banner">
          <div className="status-main">
            <span className="label">Status:</span>
            <span className={`badge ${isConnected ? 'badge-success' : 'badge-danger'}`}>
              {loading ? 'TESTING...' : isConnected ? 'OPERATIONAL' : 'DISCONNECTED'}
            </span>
          </div>

          {healthData && (
            <div className="meta-info">
              <span className="meta-item">
                <strong>Latency:</strong> {healthData.latency}ms
              </span>
              <span className="meta-item">
                <strong>Last Verified:</strong> {lastCheck}
              </span>
            </div>
          )}
        </div>

        <div className="response-box">
          <div className="response-box-header">
            <span>Raw JSON Response</span>
            <span className="http-badge">200 OK</span>
          </div>
          <pre className="json-output">
            {loading ? (
              <code className="text-muted">Connecting to Flask backend...</code>
            ) : healthData?.success ? (
              <code>{JSON.stringify(healthData.data, null, 2)}</code>
            ) : (
              <code className="text-error">{JSON.stringify({ error: healthData?.error }, null, 2)}</code>
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
