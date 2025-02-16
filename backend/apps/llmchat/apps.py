from django.apps import AppConfig


class LlmChatConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    
    name         = 'apps.llmchat'
    verbose_name = '20_llmchat'