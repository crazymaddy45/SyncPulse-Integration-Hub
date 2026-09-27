from flask import Blueprint, jsonify
from app.routes.integrations import MOCK_INTEGRATIONS
from app.routes.transactions import TRANSACTIONS

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/api/dashboard/metrics', methods=['GET'])
def get_dashboard_metrics():
    """
    Returns operational hub metrics dynamically calculated from live in-memory data:
    1. Active Integrations (from MOCK_INTEGRATIONS)
    2. Processed Transactions (from TRANSACTIONS)
    3. Successful Transactions (from TRANSACTIONS)
    4. Failed Transactions (from TRANSACTIONS)
    5. Processing / In-Flight Transactions (from TRANSACTIONS)
    """
    # Active Integrations: count integrations where status is 'Active'
    active_integrations = sum(1 for intg in MOCK_INTEGRATIONS if intg.get("status") == "Active")

    # Transaction counts calculated from existing transaction store
    tx_list = list(TRANSACTIONS.values())
    total_processed = len(tx_list)
    successful_tx = sum(1 for tx in tx_list if tx.get("status") == "Success")
    failed_tx = sum(1 for tx in tx_list if tx.get("status") == "Failed")
    processing_tx = sum(1 for tx in tx_list if tx.get("status") == "Processing")

    metrics = {
        "activeIntegrations": active_integrations,
        "processedTransactions": total_processed,
        "successfulTransactions": successful_tx,
        "failedTransactions": failed_tx,
        "processingTransactions": processing_tx
    }

    return jsonify({
        "status": "success",
        "data": metrics,
        "activeIntegrations": active_integrations,
        "processedTransactions": total_processed,
        "successfulTransactions": successful_tx,
        "failedTransactions": failed_tx,
        "processingTransactions": processing_tx
    }), 200
