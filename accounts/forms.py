from django import forms
import requests

from .models import Account


class AccountForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = ['enabled']


class TaigaForm(AccountForm):
    url = forms.URLField(
        max_length=100, initial='https://svs-dashboard.informatik.uni-hamburg.de')
    username = forms.CharField(label='Username', max_length=100)
    password = forms.CharField(
        label='Password', max_length=100, widget=forms.PasswordInput)

    def is_valid(self):
        if not super().is_valid():
            return False
        try:
            auth_url = self.cleaned_data['url']+"/api/v1/auth"
            print(auth_url)
            r = requests.post(auth_url, data={
                            'username': self.cleaned_data['username'], 'password': self.cleaned_data['password'], 'type': 'normal'})
            r.raise_for_status()
        except requests.HTTPError as err:
            print(err.response)
            print(err.response.__str__)
            self.add_error(field='password',error=forms.ValidationError(err.response.__str__))
            return False
        return True 
