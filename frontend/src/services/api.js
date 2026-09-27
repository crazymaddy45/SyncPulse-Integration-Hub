const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

/**
 * Generic JSON GET helper.
 */
async function getJSON(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetches all integrations from the SyncPulse backend.
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export async function fetchIntegrations() {
  try {
    const json = await getJSON('/api/integrations');
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Fetches a single integration by ID.
 * @param {string} id
 * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
 */
export async function fetchIntegrationById(id) {
  try {
    const json = await getJSON(`/api/integrations/${id}`);
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Fetches all transactions (summary view) from the SyncPulse backend.
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export async function fetchTransactions() {
  try {
    const json = await getJSON('/api/transactions');
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, data: [], error: error.message };
  }
}

/**
 * Fetches full details of a single transaction by ID.
 * @param {string} id
 * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
 */
export async function fetchTransactionById(id) {
  try {
    const json = await getJSON(`/api/transactions/${id}`);
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
}

/**
 * POSTs a retry request for a failed transaction.
 * @param {string} id
 * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
 */
export async function retryTransaction(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions/${id}/retry`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${response.status}`);
    }
    const json = await response.json();
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Fetches operational hub metrics dynamically calculated by the backend.
 * Calls GET /api/dashboard/metrics
 * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
 */
export async function fetchDashboardMetrics() {
  try {
    const json = await getJSON('/api/dashboard/metrics');
    return { success: true, data: json.data || json };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Requests an AI-generated explanation for a failed transaction.
 * @param {string} transactionId
 * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
 */
export async function fetchAIExplanation(transactionId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/explain`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${response.status}`);
    }

    const json = await response.json();
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Requests AI-assisted schema mapping suggestions between a source and target schema.
 * @param {string} sourceSystem
 * @param {string} targetSystem
 * @param {object} sourceSchema
 * @param {object} targetSchema
 * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
 */
export async function fetchSchemaMapping(sourceSystem, targetSystem, sourceSchema, targetSchema) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/schema-mapping/suggest`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceSystem,
        targetSystem,
        sourceSchema,
        targetSchema,
      }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${response.status}`);
    }

    const json = await response.json();
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Fetches health check status from the SyncPulse Flask backend.
 * @returns {Promise<{data: object, latency: number, timestamp: string}>}
 */
export async function fetchMonitoringOverview() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/monitoring/overview`, {
      method: 'GET',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${response.status}`);
    }

    const json = await response.json();
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
}

/**
 * Sends a business event to the backend for ingestion into the in-memory transaction store.
 * @param {object} event
 * @returns {Promise<{success: boolean, data: object|null, error?: string}>}
 */
export async function sendEvent(event) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/events`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${response.status}`);
    }

    const json = await response.json();
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
}

export async function fetchHealthStatus() {
  const url = `${API_BASE_URL}/api/health`;
  const startTime = performance.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
      latency,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);
    return {
      success: false,
      error: error.message || 'Failed to connect to backend server',
      latency,
      timestamp: new Date().toLocaleTimeString(),
    };
  }
}
