from django.contrib.auth import password_validation
from rest_framework import serializers
from django.core.exceptions import ValidationError


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        max_length=128, write_only=True, required=True)
    new_password1 = serializers.CharField(
        max_length=128, write_only=True, required=True)
    new_password2 = serializers.CharField(
        max_length=128, write_only=True, required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                {'old_password': 'Your old password was entered incorrectly. Please enter it again.'})
        return value

    def validate(self, data):
        if data['new_password1'] != data['new_password2']:
            raise serializers.ValidationError(
                {'new_password2': "The two password fields didn't match."})
        try:
            password_validation.validate_password(
                data['new_password1'], self.context['request'].user)
        except ValidationError as err:
            raise serializers.ValidationError(
                {'new_password1': ' '.join(err.messages)})
        return data

    def save(self, **kwargs):
        password = self.validated_data['new_password1']
        user = self.context['request'].user
        user.set_password(password)
        user.save()
        return user
