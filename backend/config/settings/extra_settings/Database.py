from django.conf import settings

# LOAD SECRET STEEINGS
from config.settings.read_env import read_env
env = read_env(settings.BASE_DIR)

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME':   settings.BASE_DIR / 'db.sqlite3',
    }
}
