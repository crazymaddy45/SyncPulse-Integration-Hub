import re
from flask import Blueprint, jsonify, request

schema_mapping_bp = Blueprint('schema_mapping', __name__)

KNOWN_FIELD_MAP = {
    'invoiceid': 'invoiceNumber',
    'product': 'material',
    'customerid': 'customerNumber',
    'supplierid': 'supplierNumber',
    'suppliercode': 'supplierNumber',
}


def _normalize_field_name(value):
    if value is None:
        return ''
    value = str(value)
    value = re.sub(r'(?<!^)(?=[A-Z])', '_', value)
    value = value.replace('-', '_').replace(' ', '_')
    value = re.sub(r'[^a-zA-Z0-9_]', '', value)
    return ''.join(part.lower() for part in value.split('_') if part)


def _tokenize(value):
    normalized = _normalize_field_name(value)
    return [token for token in re.findall(r'[A-Za-z]+|\d+', normalized) if token]


def _calculate_similarity(source_field, target_field):
    source_tokens = set(_tokenize(source_field))
    target_tokens = set(_tokenize(target_field))

    if not source_tokens or not target_tokens:
        return 0.0

    overlap = len(source_tokens.intersection(target_tokens))
    union = len(source_tokens.union(target_tokens))
    if union == 0:
        return 0.0

    token_similarity = overlap / union

    normalized_source = _normalize_field_name(source_field)
    normalized_target = _normalize_field_name(target_field)

    if normalized_source == normalized_target:
        return 1.0

    if normalized_target.startswith(normalized_source) or normalized_source.startswith(normalized_target):
        return 0.8

    return round(token_similarity, 2)


def _find_best_target_field(source_field, target_schema):
    if not isinstance(target_schema, dict) or not target_schema:
        return None, 0.0, 'Manual mapping required. No target fields are available for review.'

    normalized_source = _normalize_field_name(source_field)
    known_target = KNOWN_FIELD_MAP.get(normalized_source)
    if known_target and known_target in target_schema:
        return known_target, 0.9, f"{source_field} corresponds to {known_target}"

    best_target = None
    best_score = 0.0
    best_reason = 'Manual mapping required. No reasonable automatic match was found.'

    for candidate in target_schema:
        score = _calculate_similarity(source_field, candidate)
        if score > best_score:
            best_score = score
            best_target = candidate

    if best_target and best_score >= 0.75:
        if best_target.lower() == source_field.lower():
            return best_target, 1.0, 'Exact field-name match'
        return best_target, round(best_score, 2), f"{source_field} is highly similar to {best_target}"

    return None, 0.0, 'Manual mapping required. No reasonable automatic match was found.'


def _build_schema_mappings(source_schema, target_schema):
    if not isinstance(source_schema, dict):
        return []

    mappings = []
    for source_field in source_schema:
        target_field, confidence, reason = _find_best_target_field(source_field, target_schema)

        if target_field is None:
            mappings.append({
                'sourceField': source_field,
                'targetField': 'unmapped',
                'confidence': 0.0,
                'reason': reason,
                'status': 'unmapped',
            })
            continue

        mappings.append({
            'sourceField': source_field,
            'targetField': target_field,
            'confidence': confidence,
            'reason': reason,
            'status': 'mapped',
        })

    return mappings


@schema_mapping_bp.route('/api/schema-mapping/suggest', methods=['POST'])
def suggest_schema_mapping():
    payload = request.get_json(silent=True) or {}

    source_system = payload.get('sourceSystem', 'Unknown source')
    target_system = payload.get('targetSystem', 'Unknown target')
    source_schema = payload.get('sourceSchema')
    target_schema = payload.get('targetSchema')

    if not isinstance(source_schema, dict) or not isinstance(target_schema, dict):
        return jsonify({
            'status': 'error',
            'message': 'Missing or invalid sourceSchema/targetSchema payload.'
        }), 400

    if not source_schema or not target_schema:
        return jsonify({
            'status': 'error',
            'message': 'sourceSchema and targetSchema must be non-empty objects.'
        }), 400

    mappings = _build_schema_mappings(source_schema, target_schema)
    mapped_count = sum(1 for item in mappings if item.get('status') == 'mapped')
    summary = (
        f"AI-assisted/mock mapping suggestions for {source_system} to {target_system} were generated. "
        f"{mapped_count} field(s) were matched automatically; the remaining mappings should be reviewed before applying."
    )

    return jsonify({
        'status': 'success',
        'data': {
            'sourceSystem': source_system,
            'targetSystem': target_system,
            'mappings': mappings,
            'summary': summary,
            'note': 'AI suggestions should be reviewed before applying.'
        }
    }), 200
