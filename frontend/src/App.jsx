import React, { useState } from 'react';
import { HealthCard } from './components/HealthCard';
import { Dashboard } from './components/dashboard/Dashboard';
import { IntegrationExplorer } from './components/integration/IntegrationExplorer';
import { TransactionMonitor } from './components/transaction/TransactionMonitor';
import { SchemaMapper } from './components/schema/SchemaMapper';
import { MonitoringCenter } from './components/monitoring/MonitoringCenter';
import { EventIngestion } from './components/events/EventIngestion';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransactionUpdated = () => {
    // Notify Dashboard to refetch metrics when a transaction updates (e.g. retry)
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-top">
          <div className="brand-wrapper">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <h1 className="brand-title">SyncPulse</h1>
              <p className="app-subtitle">Enterprise Integration Platform</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="app-nav" aria-label="Main Navigation">
            <button
              className={`nav-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              id="tab-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
              All Modules
            </button>
            <button
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              id="tab-dashboard"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
              Dashboard
            </button>
            <button
              className={`nav-tab ${activeTab === 'integrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('integrations')}
              id="tab-integrations"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Integrations
            </button>
            <button
              className={`nav-tab ${activeTab === 'transactions' ? 'active' : ''}`}
              onClick={() => setActiveTab('transactions')}
              id="tab-transactions"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Transactions
            </button>
            <button
              className={`nav-tab ${activeTab === 'schema' ? 'active' : ''}`}
              onClick={() => setActiveTab('schema')}
              id="tab-schema"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h10" />
                <circle cx="18" cy="17" r="3" />
              </svg>
              Schema Mapping
            </button>
            <button
              className={`nav-tab ${activeTab === 'monitoring' ? 'active' : ''}`}
              onClick={() => setActiveTab('monitoring')}
              id="tab-monitoring"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 2v10" />
                <path d="M12 18v4" />
                <path d="M4.93 4.93l7.07 7.07" />
                <path d="M19.07 19.07l-7.07-7.07" />
                <circle cx="12" cy="12" r="8" />
              </svg>
              Monitoring
            </button>
            <button
              className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
              id="tab-events"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 12h16" />
                <path d="M12 4v16" />
                <path d="M5 5l14 14" />
              </svg>
              Event Ingestion
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {/* Backend health check card */}
        <HealthCard />

        {/* Module 3: Hub Metrics Dashboard */}
        {(activeTab === 'all' || activeTab === 'dashboard') && (
          <Dashboard refreshTrigger={refreshTrigger} />
        )}

        {/* Module 1: Integration Management */}
        {(activeTab === 'all' || activeTab === 'integrations') && (
          <IntegrationExplorer />
        )}

        {/* Module 2: Transaction Management */}
        {(activeTab === 'all' || activeTab === 'transactions') && (
          <TransactionMonitor onTransactionUpdated={handleTransactionUpdated} />
        )}

        {/* Module 5: Schema Mapping */}
        {(activeTab === 'all' || activeTab === 'schema') && (
          <SchemaMapper />
        )}

        {/* Module 6: Monitoring & Alerts */}
        {(activeTab === 'all' || activeTab === 'monitoring') && (
          <MonitoringCenter />
        )}

        {/* Module 7: Real-Time Event Ingestion */}
        {(activeTab === 'all' || activeTab === 'events') && (
          <EventIngestion onViewTransactions={() => setActiveTab('transactions')} />
        )}
      </main>
    </div>
  );
}
