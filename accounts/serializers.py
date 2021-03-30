import requests
from rest_framework import serializers

from .models import Account


class AccountSerializer(serializers.ModelSerializer):
    github_auth_link = serializers.ReadOnlyField()

    class Meta:
        model = Account
        fields = ['id', 'enabled', 'tool', 'credentials', 'github_auth_link']
        depth = 1
        read_only_fields = ['id', 'github_auth_link', 'credentials']


class TaigaAuthSerializer(serializers.Serializer):
    url = serializers.URLField(required=True)
    username = serializers.CharField(max_length=200)
    password = serializers.CharField(max_length=200)

    def is_valid(self, *args, **kwargs):
        if not super().is_valid(*args, **kwargs):
            return False
        try:
            auth_url = self.validated_data['url']+"/api/v1/auth"
            response = requests.post(auth_url, data={
                'username': self.validated_data['username'],
                'password': self.validated_data['password'],
                'type': 'normal'
                })
            response.raise_for_status()
        except requests.ConnectionError as e:
            raise serializers.ValidationError({'url': e})
        except requests.HTTPError as err:
            if err.response.status_code == 404:
                raise serializers.ValidationError({'url': "404 Error - please check the URL"})
            try:
                json = err.response.json()
                if '_error_message' in json:
                    msg = err.response.json()['_error_message']
                    raise serializers.ValidationError(msg)
                else:
                    raise serializers.ValidationError(err.response.text)
            except ValueError:
                raise serializers.ValidationError("Response was not decodable")
            raise serializers.ValidationError(msg)
        try:
            self.response = response.json()
        except ValueError:
            raise serializers.ValidationError("Response was not decodable")
        return True
