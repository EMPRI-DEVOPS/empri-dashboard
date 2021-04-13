from .base import *

DEBUG = True

ALLOWED_HOSTS = []

# Django soll nur in der lokalen Entwicklung die statischen Dateien managen
# In Production werden sie von vue-cli erstellt und dann direkt von nginx geliefert
# https://docs.djangoproject.com/en/3.1/howto/static-files/

INSTALLED_APPS += [
    'django.contrib.staticfiles',
]

STATIC_URL = '/static/'

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]
