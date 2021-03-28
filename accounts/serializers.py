from .models import Account
from rest_framework import serializers

class AccountSerializer(serializers.ModelSerializer):
    github_auth_link = serializers.ReadOnlyField()
    class Meta:
        model = Account
        fields = ['id', 'enabled', 'tool', 'credentials', 'github_auth_link']
        depth = 1
        read_only_fields = ['id', 'github_auth_link', 'credentials']
