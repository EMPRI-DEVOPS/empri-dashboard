from django import forms
import requests

from .models import Account


class AccountForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = ['tool']


class TaigaAuthForm(forms.Form):
    url = forms.URLField(
        max_length=100, initial='https://svs-dashboard.informatik.uni-hamburg.de')
    username = forms.CharField(label='Username', max_length=100)
    password = forms.CharField(
        label='Password', max_length=100, widget=forms.PasswordInput)

    def is_valid(self):
        if not super().is_valid():
            return False
        try:
            auth_url = credentials['url']+"/api/v1/auth"
            r = requests.post(auth_url, data={
                            'username': credentials['username'], 'password': credentials['password'], 'type': 'normal'})
            r.raise_for_status()
        except requests.HTTPError as err:
            self.add_error(error=forms.ValidationError(err.response.json()))
            return False
        return True 
