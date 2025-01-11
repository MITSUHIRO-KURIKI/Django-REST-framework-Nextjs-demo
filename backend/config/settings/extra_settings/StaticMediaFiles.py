import os
from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)

# Static files
STATIC_URL = '/static/'

# Static files
STATICFILES_DIRS = [os.path.join(settings.BASE_DIR, 'static')]

STATIC_ROOT = os.path.join(settings.BASE_DIR, 'staticfiles')


# whitenoise
## https://devcenter.heroku.com/ja/articles/django-assets
STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',  # ローカルファイルストレージを使用
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}
## https://github.com/heroku/python-getting-started/blob/main/gettingstarted/settings.py
WHITENOISE_KEEP_ONLY_HASHED_FILES = True