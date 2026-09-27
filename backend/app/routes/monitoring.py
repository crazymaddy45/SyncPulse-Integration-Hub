from flask import Blueprint, jsonify

from app.routes.integrations import MOCK_INTEGRATIONS
from app.routes.transactions import TRANSACTIONS

monitoring_bp = Blueprint('monitoring', __name__)


def _get_integration_health():
    health = {'healthy': 0, 'warning': 0, 'error': 0}

    for integration in MOCK_INTEGRATIONS:
        status = str(integration.get('status', 'Active')).strip().lower()
        if status in {'active', 'healthy'}:
            health['healthy'] += 1
        elif status == 'warning':
            health['warning'] += 1
        elif status == 'error':
            health['error'] += 1
        else:
            health['healthy'] += 1

    return health


def _get_transaction_health():
    health = {'successful': 0, 'failed': 0, 'processing': 0}

    for transaction in TRANSACTIONS.values():
        status = str(transaction.get('status', 'Processing')).strip()
        if status == 'Success':
            health['successful'] += 1
        elif status == 'Failed':
            health['failed'] += 1
        elif status == 'Processing':
            health['processing'] += 1

    return health


def _build_alerts():
    alerts = []

    for transaction in TRANSACTIONS.values():
        if transaction.get('status') != 'Failed':
            continue

        tx_type = transaction.get('type', 'Transaction')
        alerts.append({
            'id': transaction.get('id'),
            'severity': 'error',
            'type': 'Transaction Failure',
            'message': f"{tx_type} transaction failed during transformation.",
            'status': 'Failed',
        })

    return alerts


def _build_recent_events():
    events = []

    for transaction in sorted(
        TRANSACTIONS.values(),
        key=lambda tx: tx.get('timestamp') or '',
        reverse=True,
    ):
        tx_type = transaction.get('type', 'Transaction')
        status = transaction.get('status', 'Processing')

        if status == 'Success':
            message = f"{tx_type} completed successfully"
        elif status == 'Failed':
            message = f"{tx_type} failed"
        elif status == 'Processing':
            message = f"{tx_type} is processing"
        else:
            message = f"{tx_type} status is {status}"

        events.append({
            'id': transaction.get('id'),
            'type': 'Transaction',
            'message': message,
            'status': status,
        })

    return events


@monitoring_bp.route('/api/monitoring/overview', methods=['GET'])
def get_monitoring_overview():
    overview = {
        'integrationHealth': _get_integration_health(),
        'transactionHealth': _get_transaction_health(),
        'alerts': _build_alerts(),
        'recentEvents': _build_recent_events(),
    }
    return jsonify({
        'status': 'success',
        'data': overview,
    }), 200
