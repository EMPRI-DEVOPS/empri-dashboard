from django.contrib import admin

from .models import Account, GithubAuthFlow

admin.site.register(Account)
admin.site.register(GithubAuthFlow)