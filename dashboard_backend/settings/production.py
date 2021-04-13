from .base import *

DEBUG = False
SESSION_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 1
SECURE_HSTS_PRELOAD = True
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

ALLOWED_HOSTS = ['svs-dashboard.informatik.uni-hamburg.de']
