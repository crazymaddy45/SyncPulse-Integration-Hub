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


def _suggested_fix_for_field(field_name, current_value=None):
    fix_map = {
        'invoiceId': 'Enter a valid invoice ID.',
        'product': 'Enter a valid product name.',
        'quantity': 'Enter the quantity.',
        'unitPrice': 'Enter a valid numeric unit price.',
        'customerId': 'Provide a valid customer ID.',
        'supplierCode': 'Add the correct supplier code.',
    }
    base_value = fix_map.get(field_name, 'Correct the invalid field and retry.')
    if current_value == '':
        return 'Provide a value for this required field.'
    return base_value


def _build_issue_from_error(error, source_payload):
    field_name = error.get('field', 'unknown')
    current_value = error.get('currentValue', _find_payload_value(source_payload, field_name))
    message = error.get('message') or 'Field is invalid.'
    issue_type = error.get('type', 'invalid')

    if issue_type == 'missing':
        problem = 'Required field is missing.'
    elif issue_type == 'invalid_type':
        problem = f"Expected type: {error.get('expectedType', 'valid value')}."
    elif issue_type == 'invalid_value':
        problem = 'Field value is invalid for the required business rules.'
    else:
        problem = message

    return {
        'field': field_name,
        'currentValue': current_value if current_value is not None else 'empty',
        'expectedType': error.get('expectedType', 'valid value'),
        'problem': problem,
        'suggestedValue': _suggested_fix_for_field(field_name, current_value),
    }


def _build_generic_explanation(transaction):
    transaction_id = transaction.get('id')
    source = transaction.get('source') or 'unknown source'
    target = transaction.get('target') or 'unknown destination'
    tx_type = transaction.get('type') or 'transaction'
    source_payload = transaction.get('sourcePayload') or {}
    validation_errors = transaction.get('validationErrors') or []
    error_message = transaction.get('errorMessage') or ''
    error_lower = error_message.lower()
    payload_lower = str(source_payload).lower()
    combined_text = f"{error_lower} {payload_lower}"

    if validation_errors:
        issues = [_build_issue_from_error(error, source_payload) for error in validation_errors]
        issue_count = len(issues)
        summary = f"The transaction failed because {issue_count} required field{'s' if issue_count != 1 else ''} are missing or invalid."
        root_cause = 'The submitted payload does not satisfy the required schema for this transaction.'
        impact = f'The {tx_type.lower()} could not be validated and therefore was not transformed or sent from {source} to {target}.'
        recommendation = 'Correct all listed fields and retry the transaction.'
        first_issue = issues[0] if issues else {
            'field': 'unknown',
            'currentValue': 'unknown',
            'expectedType': 'valid value',
            'problem': 'An invalid field was found.',
            'suggestedValue': 'Review and correct the invalid field before retrying.'
        }
        return {
            'transactionId': transaction_id,
            'summary': summary,
            'rootCause': root_cause,
            'impact': impact,
            'recommendation': recommendation,
            'issues': issues,
            'suggestedFix': {
                'field': first_issue['field'],
                'currentValue': first_issue['currentValue'],
                'expectedType': first_issue['expectedType'],
                'suggestedValue': first_issue['suggestedValue'],
            },
        }

    failure_profiles = [
        {
            'keys': ['unitprice', 'unit_price'],
            'summary': 'The transaction failed because the unitPrice value is invalid.',
            'rootCause': 'The destination schema expects unitPrice to be a numeric value, but the source payload contains an invalid entry.',
            'impact': f'The {tx_type.lower()} could not be transformed and could not be sent from {source} to {target}.',
            'recommendation': 'Replace the invalid unitPrice value with a valid numeric amount before retrying the transaction.',
            'field': 'unitPrice',
            'expectedType': 'number',
            'suggestedValue': 'Enter a valid numeric unit price.',
        },
        {
            'keys': ['customerid', 'customer_id'],
            'summary': 'The transaction failed because the customer identifier is missing or invalid.',
            'rootCause': 'The downstream system requires a valid customer ID, but the payload is missing or malformed.',
            'impact': f'The {tx_type.lower()} could not be processed for {source} to {target}.',
            'recommendation': 'Supply a valid customer ID before retrying the transaction.',
            'field': 'customerId',
            'expectedType': 'string',
            'suggestedValue': 'Provide a valid customer ID.',
        },
        {
            'keys': ['suppliercode', 'supplier_code', 'vendorcode', 'vendor_code'],
            'summary': 'The transaction failed because the supplier code is missing or invalid.',
            'rootCause': 'The destination mapping requires a supplier code to route the payload correctly.',
            'impact': f'The {tx_type.lower()} could not be matched to the correct supplier destination.',
            'recommendation': 'Add the correct supplier code to the payload before retrying.',
            'field': 'supplierCode',
            'expectedType': 'string',
            'suggestedValue': 'Add the correct supplier code.',
        },
        {
            'keys': ['quantity'],
            'summary': 'The transaction failed because the quantity value is invalid.',
            'rootCause': 'The source quantity does not conform to the expected numeric or business-rule constraints.',
            'impact': f'The {tx_type.lower()} could not be transformed and no delivery was created.',
            'recommendation': 'Correct the quantity field to a valid positive value before retrying.',
            'field': 'quantity',
            'expectedType': 'number',
            'suggestedValue': 'Enter the quantity.',
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
                'issues': [{
                    'field': profile['field'],
                    'currentValue': field_value if field_value is not None else 'unknown',
                    'expectedType': profile['expectedType'],
                    'problem': 'The field is invalid or missing.',
                    'suggestedValue': profile['suggestedValue'],
                }],
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
        'issues': [{
            'field': 'unknown',
            'currentValue': error_message or 'unknown',
            'expectedType': 'valid payload value',
            'problem': 'The transaction contains an invalid payload or failed validation.',
            'suggestedValue': 'Review and correct the invalid field before retrying.',
        }],
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
