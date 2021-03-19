from django import forms
import requests

from .models import Account


class AccountForm(forms.ModelForm):
    class Meta:
        model = Account
        fields = ['enabled']


class TaigaForm(AccountForm):
    url = forms.URLField(label='URL of Taiga Instance',
                         max_length=100, initial='https://svs-dashboard.informatik.uni-hamburg.de')
    username = forms.CharField(label='Username', max_length=100)
    password = forms.CharField(
        label='Password', max_length=100, widget=forms.PasswordInput)

    def is_valid(self):
        if not super().is_valid():
            return False
        try:
            auth_url = self.cleaned_data['url']+"/api/v1/auth"
            r = requests.post(auth_url, data={
                'username': self.cleaned_data['username'], 'password': self.cleaned_data['password'], 'type': 'normal'})
            r.raise_for_status()
        except requests.HTTPError as err:
            msg = "Could not validate Taiga credentials: "
            if err.response.status_code == 404:
                self.add_error(
                    field='url', error=forms.ValidationError("404 Error - please check the URL"))
                return False
            try:
                json = err.response.json()
                if '_error_message' in err.response.json():
                    msg += err.response.json()['_error_message']
                else:
                    msg += err.response.text
            except:
                msg += err.response.text
            self.add_error(field=None, error=forms.ValidationError(msg))
            return False
        self.response = r.json()
        return True
