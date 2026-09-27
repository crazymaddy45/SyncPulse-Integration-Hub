import copy
import math
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

from app.routes.transactions import TRANSACTIONS


events_bp = Blueprint('events', __name__)


def _next_transaction_id():
    """Generate the next TX-xxxx identifier based on the in-memory collection."""
    tx_ids = [tx_id for tx_id in TRANSACTIONS.keys() if tx_id.startswith('TX-')]
    numbers = []

    for tx_id in tx_ids:
        try:
            numbers.append(int(tx_id.split('-')[1]))
        except (IndexError, ValueError):
            continue

    next_number = max(numbers, default=1004) + 1
    return f"TX-{next_number}"


def _coerce_positive_number(value, field_name):
    if value is None or value == '':
        raise ValueError(f"{field_name} is required")
    try:
        numeric_value = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be a valid positive number")
    if not math.isfinite(numeric_value) or numeric_value <= 0:
        raise ValueError(f"{field_name} must be a valid positive number")
    return numeric_value


@events_bp.route('/api/events', methods=['POST'])
def create_event_transaction():
    """Accept an external business event and create a corresponding transaction."""
    data = request.get_json(silent=True) or {}

    required = ['type', 'source', 'target', 'payload']
    missing = [field for field in required if field not in data or data[field] in (None, '')]
    if missing:
        tx_id = _next_transaction_id()
        failed_transaction = {
            'id': tx_id,
            'type': str(data.get('type', 'Invoice')).strip() or 'Invoice',
            'source': str(data.get('source', '')).strip() or 'Unknown',
            'target': str(data.get('target', '')).strip() or 'Unknown',
            'status': 'Failed',
            'timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'integrationId': 'intg-event-ingest',
            'sourcePayload': data.get('payload') if isinstance(data.get('payload'), dict) else {},
            'transformedPayload': None,
            'errorMessage': f"Validation failed: missing required field(s): {', '.join(missing)}",
            'executionSteps': [
                {'id': 1, 'name': 'Received', 'status': 'completed', 'detail': 'Event received from external source'},
                {'id': 2, 'name': 'Validated', 'status': 'completed', 'detail': 'Event validation failed'},
                {'id': 3, 'name': 'Transformation', 'status': 'failed', 'detail': 'Event payload validation failed'},
                {'id': 4, 'name': 'Send to ERP', 'status': 'skipped', 'detail': 'Skipped because validation failed'},
                {'id': 5, 'name': 'Result', 'status': 'failed', 'detail': 'Transaction failed'}
            ]
        }
        TRANSACTIONS[tx_id] = copy.deepcopy(failed_transaction)
        return jsonify({
            'status': 'success',
            'message': 'Event processed with validation errors',
            'data': failed_transaction
        }), 201

    if not isinstance(data['payload'], dict):
        tx_id = _next_transaction_id()
        failed_transaction = {
            'id': tx_id,
            'type': str(data.get('type', 'Invoice')).strip() or 'Invoice',
            'source': str(data.get('source', '')).strip() or 'Unknown',
            'target': str(data.get('target', '')).strip() or 'Unknown',
            'status': 'Failed',
            'timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'integrationId': 'intg-event-ingest',
            'sourcePayload': {},
            'transformedPayload': None,
            'errorMessage': 'Validation failed: payload must be an object',
            'executionSteps': [
                {'id': 1, 'name': 'Received', 'status': 'completed', 'detail': 'Event received from external source'},
                {'id': 2, 'name': 'Validated', 'status': 'completed', 'detail': 'Event validation failed'},
                {'id': 3, 'name': 'Transformation', 'status': 'failed', 'detail': 'Event payload validation failed'},
                {'id': 4, 'name': 'Send to ERP', 'status': 'skipped', 'detail': 'Skipped because validation failed'},
                {'id': 5, 'name': 'Result', 'status': 'failed', 'detail': 'Transaction failed'}
            ]
        }
        TRANSACTIONS[tx_id] = copy.deepcopy(failed_transaction)
        return jsonify({
            'status': 'success',
            'message': 'Event processed with validation errors',
            'data': failed_transaction
        }), 201

    event_type = str(data['type']).strip()
    source = str(data['source']).strip()
    target = str(data['target']).strip()
    event_payload = data['payload']

    validation_error = None

    if event_type.lower() == 'invoice':
        required_invoice_fields = ['invoiceId', 'product', 'quantity', 'unitPrice']
        missing_invoice_fields = [
            field for field in required_invoice_fields
            if field not in event_payload or event_payload.get(field) in (None, '')
        ]

        if missing_invoice_fields:
            validation_error = f"Invoice validation failed: missing required field(s): {', '.join(missing_invoice_fields)}"
        else:
            try:
                _coerce_positive_number(event_payload.get('quantity'), 'quantity')
                _coerce_positive_number(event_payload.get('unitPrice'), 'unitPrice')
            except ValueError as exc:
                validation_error = str(exc)

    if validation_error:
        tx_id = _next_transaction_id()
        failed_transaction = {
            'id': tx_id,
            'type': event_type,
            'source': source,
            'target': target,
            'status': 'Failed',
            'timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
            'integrationId': 'intg-event-ingest',
            'sourcePayload': {
                'invoiceId': event_payload.get('invoiceId'),
                'product': event_payload.get('product'),
                'quantity': event_payload.get('quantity'),
                'unitPrice': event_payload.get('unitPrice')
            },
            'transformedPayload': None,
            'errorMessage': validation_error,
            'executionSteps': [
                {'id': 1, 'name': 'Received', 'status': 'completed', 'detail': 'Event received from external source'},
                {'id': 2, 'name': 'Validated', 'status': 'completed', 'detail': 'Event validation failed'},
                {'id': 3, 'name': 'Transformation', 'status': 'failed', 'detail': 'Event validation failed'},
                {'id': 4, 'name': 'Send to ERP', 'status': 'skipped', 'detail': 'Skipped because validation failed'},
                {'id': 5, 'name': 'Result', 'status': 'failed', 'detail': 'Transaction failed'}
            ]
        }
        TRANSACTIONS[tx_id] = copy.deepcopy(failed_transaction)
        return jsonify({
            'status': 'success',
            'message': 'Event processed with validation errors',
            'data': failed_transaction
        }), 201

    tx_id = _next_transaction_id()
    transaction = {
        'id': tx_id,
        'type': event_type,
        'source': source,
        'target': target,
        'status': 'Success',
        'timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),
        'integrationId': 'intg-event-ingest',
        'sourcePayload': {
            'invoiceId': event_payload.get('invoiceId'),
            'product': event_payload.get('product'),
            'quantity': event_payload.get('quantity'),
            'unitPrice': event_payload.get('unitPrice')
        },
        'transformedPayload': {
            'invoiceNumber': event_payload.get('invoiceId'),
            'material': event_payload.get('product'),
            'quantity': event_payload.get('quantity'),
            'unitPrice': event_payload.get('unitPrice')
        },
        'errorMessage': None,
        'executionSteps': [
            {'id': 1, 'name': 'Received', 'status': 'completed', 'detail': 'Event received from external source'},
            {'id': 2, 'name': 'Validated', 'status': 'completed', 'detail': 'Event payload validated'},
            {'id': 3, 'name': 'Transformation', 'status': 'completed', 'detail': 'Mapped invoice payload to SAP invoice format'},
            {'id': 4, 'name': 'Send to ERP', 'status': 'completed', 'detail': 'Payload delivered to SAP ERP invoice endpoint'},
            {'id': 5, 'name': 'Result', 'status': 'completed', 'detail': 'Event processed successfully'}
        ]
    }

    TRANSACTIONS[tx_id] = copy.deepcopy(transaction)

    return jsonify({
        'status': 'success',
        'message': 'Event processed successfully',
        'data': transaction
    }), 201
