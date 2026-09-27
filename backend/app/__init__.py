from flask import Flask
from flask_cors import CORS
from app.routes.health import health_bp
from app.routes.integrations import integrations_bp
from app.routes.transactions import transactions_bp
from app.routes.dashboard import dashboard_bp
from app.routes.ai import ai_bp
from app.routes.schema_mapping import schema_mapping_bp
from app.routes.monitoring import monitoring_bp
from app.routes.events import events_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    # Configure CORS for all API routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    app.register_blueprint(health_bp)
    app.register_blueprint(integrations_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(schema_mapping_bp)
    app.register_blueprint(monitoring_bp)
    app.register_blueprint(events_bp)

    return app
