from django import forms

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
