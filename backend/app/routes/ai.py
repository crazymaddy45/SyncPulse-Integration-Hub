from flask import Blueprint, jsonify, request

from app.routes.transactions import TRANSACTIONS

ai_bp = Blueprint('ai', __name__)


def _find_payload_value(payload, field_name):
    if not isinstance(payload, dict):
        return None

    if field_name in payload:
        return payload[field_name]

    for value in payload.values():
        if isinstance(value, dict):
            found = _find_payload_value(value, field_name)
            if found is not None:
                return found
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    found = _find_payload_value(item, field_name)
                    if found is not None:
                        return found
    return None


def _build_generic_explanation(transaction):
    transaction_id = transaction.get('id')
    source = transaction.get('source') or 'unknown source'
    target = transaction.get('target') or 'unknown destination'
    tx_type = transaction.get('type') or 'transaction'
    error_message = transaction.get('errorMessage') or ''
    source_payload = transaction.get('sourcePayload') or {}

    error_lower = error_message.lower()
    payload_lower = str(source_payload).lower()
    combined_text = f"{error_lower} {payload_lower}"

    failure_profiles = [
        {
            'keys': ['unitprice', 'unit_price'],
            'summary': 'The transaction failed because the unitPrice value is invalid.',
            'rootCause': 'The destination schema expects unitPrice to be a numeric value, but the source payload contains an invalid entry.',
            'impact': f'The {tx_type.lower()} could not be transformed and could not be sent from {source} to {target}.',
            'recommendation': 'Replace the invalid unitPrice value with a valid numeric amount before retrying the transaction.',
            'field': 'unitPrice',
            'expectedType': 'number',
            'suggestedValue': 50000,
        },
        {
            'keys': ['customerid', 'customer_id'],
            'summary': 'The transaction failed because the customer identifier is missing or invalid.',
            'rootCause': 'The downstream system requires a valid customer ID, but the payload is missing or malformed.',
            'impact': f'The {tx_type.lower()} could not be processed for {source} to {target}.',
            'recommendation': 'Supply a valid customer ID before retrying the transaction.',
            'field': 'customerId',
            'expectedType': 'string',
            'suggestedValue': 'VALID_CUSTOMER_ID',
        },
        {
            'keys': ['suppliercode', 'supplier_code', 'vendorcode', 'vendor_code'],
            'summary': 'The transaction failed because the supplier code is missing or invalid.',
            'rootCause': 'The destination mapping requires a supplier code to route the payload correctly.',
            'impact': f'The {tx_type.lower()} could not be matched to the correct supplier destination.',
            'recommendation': 'Add the correct supplier code to the payload before retrying.',
            'field': 'supplierCode',
            'expectedType': 'string',
            'suggestedValue': 'SUPPLIER-001',
        },
        {
            'keys': ['quantity'],
            'summary': 'The transaction failed because the quantity value is invalid.',
            'rootCause': 'The source quantity does not conform to the expected numeric or business-rule constraints.',
            'impact': f'The {tx_type.lower()} could not be transformed and no delivery was created.',
            'recommendation': 'Correct the quantity field to a valid positive value before retrying.',
            'field': 'quantity',
            'expectedType': 'number',
            'suggestedValue': 1,
        },
    ]

    for profile in failure_profiles:
        if any(key in combined_text for key in profile['keys']):
            field_value = _find_payload_value(source_payload, profile['field'])
            return {
                'transactionId': transaction_id,
                'summary': profile['summary'],
                'rootCause': profile['rootCause'],
                'impact': profile['impact'],
                'recommendation': profile['recommendation'],
                'suggestedFix': {
                    'field': profile['field'],
                    'currentValue': field_value if field_value is not None else 'unknown',
                    'expectedType': profile['expectedType'],
                    'suggestedValue': profile['suggestedValue'],
                },
            }

    return {
        'transactionId': transaction_id,
        'summary': 'The transaction failed during processing.',
        'rootCause': 'An error occurred while processing the transaction.',
        'impact': 'The transaction could not be completed.',
        'recommendation': 'Review the transaction error and source payload before retrying.',
        'suggestedFix': {
            'field': 'unknown',
            'currentValue': error_message or 'unknown',
            'expectedType': 'valid payload value',
            'suggestedValue': 'Review and correct the invalid field before retrying.',
        },
    }


@ai_bp.route('/api/ai/explain', methods=['POST'])
def explain_transaction():
    payload = request.get_json(silent=True) or {}
    transaction_id = payload.get('transactionId')

    if not transaction_id:
        return jsonify({
            'status': 'error',
            'message': 'Missing transactionId in request body'
        }), 400

    transaction = TRANSACTIONS.get(transaction_id)
    if not transaction:
        return jsonify({
            'status': 'error',
            'message': f"Transaction '{transaction_id}' was not found"
        }), 404

    if transaction.get('status') != 'Failed':
        return jsonify({
            'status': 'error',
            'message': 'AI failure analysis is only available for failed transactions.'
        }), 400

    explanation = _build_generic_explanation(transaction)
    return jsonify({
        'status': 'success',
        'data': explanation
    }), 200
