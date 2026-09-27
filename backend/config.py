import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'syncpulse-dev-secret-key')
    CORS_HEADERS = 'Content-Type'
