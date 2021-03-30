import string
import random
from urllib.parse import urlencode, urlunsplit
import requests
from django.db import models
from django.conf import settings


class Account(models.Model):
    ToolType = models.TextChoices('ToolType', 'Taiga Github Mattermost')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='accounts',
        on_delete=models.CASCADE
    )
    tool = models.CharField(max_length=10, choices=ToolType.choices)
    enabled = models.BooleanField(default=True)
    credentials = models.JSONField(blank=True, null=True)
    username = models.CharField(max_length=100, blank=True, default='')
    instance_url = models.URLField(max_length=100, blank=True, default='')

    def __str__(self):
        return str(self.tool)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.tool == 'Github':
            if not hasattr(self, 'github_auth_flow'):
                github_auth = GithubAuthFlow(account=self)
                github_auth.save()

    @property
    def github_auth_link(self):
        """generates a link for signin up with github"""
        if self.github_auth:
            state_parameter = self.github_auth.state_parameter
            client_id = settings.GITHUB_CLIENT_ID
            query = dict(
                client_id=client_id,
                state=state_parameter,
                allow_signup='false'
            )
            return urlunsplit((
                'https',
                'github.com',
                '/login/oauth/authorize',
                urlencode(query), ''))
        return None


class GithubAuthFlow(models.Model):
    """model for saving the github auth flow parameters"""
    account = models.OneToOneField(
        Account, on_delete=models.CASCADE,
        related_name='github_auth',
        primary_key=True
    )
    state_parameter = models.CharField(max_length=24)

    def save(self, *args, **kwargs):
        if not self.state_parameter:
            self.state_parameter = self.generate_state_parameter()
        super().save(*args, **kwargs)

    def generate_state_parameter(self, size=12):
        """generates a state parameter for the github web application flow"""
        chars = string.ascii_uppercase+string.digits
        return ''.join(random.choice(chars) for i in range(size))

    def get_access_token(self, code):
        """pulls the access token from github"""
        auth_response = requests.post("https://github.com/login/oauth/access_token", data={
            'client_id': settings.GITHUB_CLIENT_ID,
            'client_secret': settings.GITHUB_CLIENT_SECRET,
            'code': code
        }, headers={'Accept': 'application/json'})
        auth_response.raise_for_status()
        try:
            auth_response_dict = auth_response.json()
        except ValueError:
            raise Exception(auth_response.content)
        if 'error' in auth_response_dict:
            raise Exception(auth_response_dict['error'])

        access_token = auth_response_dict['access_token']
        user_response = requests.get("https://api.github.com/user", headers={
            'Authorization': 'token '+access_token
        })
        user_response.raise_for_status()
        user_response_dict = user_response.json()
        self.account.username = user_response_dict['login']
        self.account.credentials = auth_response_dict
        self.account.save()

    def __str__(self):
        return self.state_parameter
