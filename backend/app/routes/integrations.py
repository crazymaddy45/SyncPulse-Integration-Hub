from flask import Blueprint, jsonify

integrations_bp = Blueprint('integrations', __name__)

MOCK_INTEGRATIONS = [
    {
        "id": "intg-shopify-sap",
        "name": "Shopify → SAP ERP",
        "status": "Active",
        "source": "Shopify",
        "destination": "SAP ERP",
        "description": "Customer orders are validated, transformed, and sent to SAP ERP.",
        "last_sync": "2 mins ago",
        "pipeline": [
            {"id": "step-1", "name": "Receive Payload", "status": "completed", "details": "Webhook received for order #SH-9842"},
            {"id": "step-2", "name": "Validate Schema", "status": "completed", "details": "JSON schema validated successfully (12 attributes)"},
            {"id": "step-3", "name": "Transform Schema", "status": "completed", "details": "Mapped Shopify items to SAP IDoc format"},
            {"id": "step-4", "name": "Send to Destination", "status": "completed", "details": "Payload delivered to SAP ERP endpoint"},
            {"id": "step-5", "name": "Success", "status": "completed", "details": "SAP Document Created: #4500089123"}
        ]
    },
    {
        "id": "intg-sap-acme",
        "name": "SAP ERP → Acme Supplier",
        "status": "Active",
        "source": "SAP ERP",
        "destination": "Acme Supplier",
        "description": "Purchase orders are sent to the supplier.",
        "last_sync": "15 mins ago",
        "pipeline": [
            {"id": "step-1", "name": "Receive Payload", "status": "completed", "details": "PO #PO-4029 event triggered in SAP ERP"},
            {"id": "step-2", "name": "Validate Schema", "status": "completed", "details": "EDI 850 schema validated"},
            {"id": "step-3", "name": "Transform Schema", "status": "completed", "details": "Converted IDoc to Acme XML standard format"},
            {"id": "step-4", "name": "Send to Destination", "status": "completed", "details": "HTTP POST request sent to Acme supplier gateway"},
            {"id": "step-5", "name": "Success", "status": "completed", "details": "Supplier Acknowledgment received (ACK 200)"}
        ]
    },
    {
        "id": "intg-wms-sap",
        "name": "WMS → SAP ERP",
        "status": "Active",
        "source": "WMS",
        "destination": "SAP ERP",
        "description": "Warehouse inventory and shipment updates are sent to SAP ERP.",
        "last_sync": "1 hour ago",
        "pipeline": [
            {"id": "step-1", "name": "Receive Payload", "status": "completed", "details": "Batch inventory update payload received (#INV-8821)"},
            {"id": "step-2", "name": "Validate Schema", "status": "completed", "details": "Warehouse stock movement schema verified"},
            {"id": "step-3", "name": "Transform Schema", "status": "completed", "details": "Transformed stock quantities across 45 SKUs"},
            {"id": "step-4", "name": "Send to Destination", "status": "completed", "details": "Transmitted to SAP MB1C OData endpoint"},
            {"id": "step-5", "name": "Success", "status": "completed", "details": "Inventory levels successfully synchronized in SAP"}
        ]
    },
    {
        "id": "intg-supplier-sap-inv",
        "name": "Supplier → SAP Invoice",
        "status": "Error",
        "source": "Supplier Portal",
        "destination": "SAP ERP",
        "description": "Supplier invoice integration currently has a transformation error.",
        "last_sync": "5 mins ago",
        "error_details": "Transformation Error: Field 'TAX_ID_VAL' is missing in header mapping table.",
        "pipeline": [
            {"id": "step-1", "name": "Receive Payload", "status": "completed", "details": "Vendor invoice payload received (#INV-2026-004)"},
            {"id": "step-2", "name": "Validate Schema", "status": "completed", "details": "Vendor payload XML structure validated"},
            {"id": "step-3", "name": "Transform Schema", "status": "failed", "details": "Transformation Error: 'TAX_ID_VAL' missing in header mapping"},
            {"id": "step-4", "name": "Send to Destination", "status": "skipped", "details": "Execution halted prior to destination delivery"},
            {"id": "step-5", "name": "Failure", "status": "failed", "details": "Error: Integration pipeline aborted due to schema transformation failure"}
        ]
    }
]

@integrations_bp.route('/api/integrations', methods=['GET'])
def get_integrations():
    """Returns list of all integration modules."""
    return jsonify({
        "status": "success",
        "count": len(MOCK_INTEGRATIONS),
        "data": MOCK_INTEGRATIONS
    }), 200

@integrations_bp.route('/api/integrations/<integration_id>', methods=['GET'])
def get_integration_by_id(integration_id):
    """Returns details for a specific integration by ID."""
    integration = next((item for item in MOCK_INTEGRATIONS if item["id"] == integration_id), None)
    if not integration:
        return jsonify({
            "status": "error",
            "message": f"Integration with ID '{integration_id}' was not found"
        }), 404

    return jsonify({
        "status": "success",
        "data": integration
    }), 200
