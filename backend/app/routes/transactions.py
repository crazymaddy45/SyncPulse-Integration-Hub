import copy
from datetime import datetime, timezone
from flask import Blueprint, jsonify

transactions_bp = Blueprint('transactions', __name__)

# ---------------------------------------------------------------------------
# In-memory mock data store (mutable for retry simulation)
# ---------------------------------------------------------------------------

_BASE_TRANSACTIONS = [
    {
        "id": "TX-1001",
        "type": "Order",
        "source": "Shopify",
        "target": "SAP ERP",
        "status": "Success",
        "timestamp": "2026-09-25T12:03:44Z",
        "integrationId": "intg-shopify-sap",
        "sourcePayload": {
            "orderId": "SH-9842",
            "customer": "John Doe",
            "items": [{"sku": "LAPTOP-01", "qty": 2, "price": 1299.00}],
            "total": 2598.00,
            "currency": "USD"
        },
        "transformedPayload": {
            "sapDocumentType": "OR",
            "soldToParty": "CUST-10042",
            "items": [{"material": "MAT-LAPTOP-01", "quantity": 2, "netPrice": 1299.00}],
            "orderValue": 2598.00,
            "salesOrg": "1000"
        },
        "errorMessage": None,
        "executionSteps": [
            {"id": 1, "name": "Received",       "status": "completed", "detail": "Shopify webhook received for order #SH-9842"},
            {"id": 2, "name": "Validated",      "status": "completed", "detail": "JSON schema validated (8 fields)"},
            {"id": 3, "name": "Transformation", "status": "completed", "detail": "Mapped to SAP IDoc OR format"},
            {"id": 4, "name": "Send to ERP",    "status": "completed", "detail": "HTTP POST → SAP ERP sales order endpoint"},
            {"id": 5, "name": "Success",        "status": "completed", "detail": "SAP Sales Order created: #4500089123"}
        ]
    },
    {
        "id": "TX-1002",
        "type": "Purchase Order",
        "source": "SAP ERP",
        "target": "Acme Supplier",
        "status": "Success",
        "timestamp": "2026-09-25T11:47:20Z",
        "integrationId": "intg-sap-acme",
        "sourcePayload": {
            "poNumber": "PO-4029",
            "vendor": "ACME-001",
            "items": [{"material": "RAW-STEEL-5MM", "quantity": 500, "unit": "KG"}],
            "deliveryDate": "2026-10-05",
            "currency": "USD"
        },
        "transformedPayload": {
            "ediType": "850",
            "tradingPartner": "ACME-SUPPLIER",
            "lineItems": [{"productCode": "RS-5MM", "orderedQty": 500, "uom": "KG"}],
            "requestedDelivery": "20261005"
        },
        "errorMessage": None,
        "executionSteps": [
            {"id": 1, "name": "Received",       "status": "completed", "detail": "SAP ERP PO #PO-4029 event triggered"},
            {"id": 2, "name": "Validated",       "status": "completed", "detail": "EDI 850 schema validated"},
            {"id": 3, "name": "Transformation",  "status": "completed", "detail": "Converted IDoc to Acme XML format"},
            {"id": 4, "name": "Send to ERP",     "status": "completed", "detail": "Transmitted to Acme supplier gateway"},
            {"id": 5, "name": "Success",         "status": "completed", "detail": "Supplier ACK received (HTTP 200)"}
        ]
    },
    {
        "id": "TX-1003",
        "type": "Invoice",
        "source": "Supplier Portal",
        "target": "SAP ERP",
        "status": "Failed",
        "timestamp": "2026-09-25T13:15:08Z",
        "integrationId": "intg-supplier-sap-inv",
        "sourcePayload": {
            "invoiceId": "INV-5001",
            "product": "Laptop",
            "quantity": 10,
            "unitPrice": "N/A"
        },
        "transformedPayload": None,
        "errorMessage": 'Schema ValidationError: "unitPrice" expected number, received string "N/A"',
        "executionSteps": [
            {"id": 1, "name": "Received",       "status": "completed", "detail": "Vendor invoice payload received (#INV-5001)"},
            {"id": 2, "name": "Validated",      "status": "completed", "detail": "Structural XML validation passed"},
            {"id": 3, "name": "Transformation", "status": "failed",    "detail": "Failed to transform invoice because unitPrice is invalid"},
            {"id": 4, "name": "Send to ERP",    "status": "skipped",   "detail": "Skipped because transformation failed"},
            {"id": 5, "name": "Result",         "status": "failed",    "detail": "Transaction failed"}
        ]
    },
    {
        "id": "TX-1004",
        "type": "Shipment",
        "source": "WMS",
        "target": "SAP ERP",
        "status": "Processing",
        "timestamp": "2026-09-25T18:50:01Z",
        "integrationId": "intg-wms-sap",
        "sourcePayload": {
            "shipmentId": "SHP-8821",
            "warehouse": "WH-DE-01",
            "items": [{"sku": "LAPTOP-01", "shipped": 25}],
            "carrier": "DHL",
            "trackingNumber": "DHL-00340434683820"
        },
        "transformedPayload": None,
        "errorMessage": None,
        "executionSteps": [
            {"id": 1, "name": "Received",       "status": "completed",   "detail": "WMS shipment event received (#SHP-8821)"},
            {"id": 2, "name": "Validated",       "status": "completed",   "detail": "Shipment schema validated"},
            {"id": 3, "name": "Transformation",  "status": "processing",  "detail": "Converting to SAP goods movement format…"},
            {"id": 4, "name": "Send to ERP",     "status": "pending",     "detail": "Awaiting transformation completion"},
            {"id": 5, "name": "Result",          "status": "pending",     "detail": "Pending"}
        ]
    },
]

# Work on a mutable deep-copy so retries persist in memory during the session
TRANSACTIONS = {tx["id"]: copy.deepcopy(tx) for tx in _BASE_TRANSACTIONS}


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@transactions_bp.route('/api/transactions', methods=['GET'])
def get_transactions():
    """
    Returns all transactions.
    Every transaction contains: id, type, source, target, status,
    timestamp, integrationId, sourcePayload, transformedPayload,
    errorMessage, executionSteps.
    """
    data = list(TRANSACTIONS.values())
    return jsonify({"status": "success", "count": len(data), "data": data}), 200


@transactions_bp.route('/api/transactions/<tx_id>', methods=['GET'])
def get_transaction(tx_id):
    """Returns the complete transaction information for a single transaction."""
    tx = TRANSACTIONS.get(tx_id)
    if not tx:
        return jsonify({"status": "error", "message": f"Transaction '{tx_id}' not found"}), 404
    return jsonify({"status": "success", "data": tx}), 200


@transactions_bp.route('/api/transactions/<tx_id>/retry', methods=['POST'])
def retry_transaction(tx_id):
    """
    Retry a failed transaction.
    Only Failed transactions can be retried.
    For TX-1003, when retry is requested: Failed → Processing → Success.
    After successful retry:
      - status = Success
      - errorMessage = null
      - all execution steps = completed
      - transformedPayload = valid SAP-style payload:
        {
          "invoiceNumber": "INV-5001",
          "material": "Laptop",
          "quantity": 10,
          "unitPrice": 50000
        }
    """
    tx = TRANSACTIONS.get(tx_id)
    if not tx:
        return jsonify({"status": "error", "message": f"Transaction '{tx_id}' not found"}), 404

    if tx["status"] != "Failed":
        return jsonify({
            "status": "error",
            "message": f"Only Failed transactions can be retried. Current status: {tx['status']}"
        }), 400

    # Simulate retry: Failed → Success
    tx["status"] = "Success"
    tx["errorMessage"] = None
    tx["timestamp"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Transformed payload specified by the requirement
    tx["transformedPayload"] = {
        "invoiceNumber": "INV-5001",
        "material": "Laptop",
        "quantity": 10,
        "unitPrice": 50000
    }

    # Mark all execution steps as completed
    tx["executionSteps"] = [
        {"id": 1, "name": "Received",       "status": "completed", "detail": "Vendor invoice payload received (#INV-5001)"},
        {"id": 2, "name": "Validated",      "status": "completed", "detail": "Structural XML validation passed"},
        {"id": 3, "name": "Transformation", "status": "completed", "detail": "Mapped to SAP invoice format (unitPrice corrected to 50000)"},
        {"id": 4, "name": "Send to ERP",    "status": "completed", "detail": "Payload delivered to SAP ERP invoice endpoint"},
        {"id": 5, "name": "Result",         "status": "completed", "detail": "SAP Document Created: #5105000456"}
    ]

    return jsonify({
        "status": "success",
        "message": f"Transaction {tx_id} retried successfully",
        "data": tx
    }), 200

