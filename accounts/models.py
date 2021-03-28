from django.db import models
from django.conf import settings
from django.shortcuts import reverse
from urllib.parse import urlencode, quote, urlunsplit

import requests, string, random


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

    def __str__(self):
        return self.tool

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.tool == 'Github':
            if not hasattr(self, 'github_auth_flow'):
                github_auth = GithubAuthFlow(account=self)
                github_auth.save()

    @property
    def github_auth_link(self):
        if self.github_auth:
            state_parameter = self.github_auth.state_parameter
            client_id = settings.GITHUB_CLIENT_ID
            query = dict(
                client_id=client_id,
                state=state_parameter,
                allow_signup='false'
            )
            return urlunsplit(('https','github.com', '/login/oauth/authorize', urlencode(query), ''))
        return null



    def get_absolute_url(self):
        return reverse("accounts:detail", kwargs={"pk": self.pk})

    def do_taiga_auth(self, credentials: dict):
        auth_url = credentials['url']+"/api/v1/auth"
        r = requests.post(auth_url, data={
                          'username': credentials['username'], 'password': credentials['password'], 'type': 'normal'})
        r.raise_for_status()
        return r.json()


class GithubAuthFlow(models.Model):

    account = models.OneToOneField(
        Account, on_delete=models.CASCADE, related_name='github_auth', primary_key=True
    )
    state_parameter = models.CharField(max_length=24)

    def save(self, *args, **kwargs):
        if not self.state_parameter:
            self.state_parameter = self.generate_state_parameter()
        super().save(*args, **kwargs)

    def generate_state_parameter(self, size=12):
        return ''.join(random.choice(string.ascii_uppercase + string.digits) for i in range(size))

    def get_access_token(self, code):
        print("code:")
        print(code)
        r = requests.post("https://github.com/login/oauth/access_token", data={
            'client_id' : settings.GITHUB_CLIENT_ID,
            'client_secret': settings.GITHUB_CLIENT_SECRET,
            'code': code
        }, headers={'Accept': 'application/json'})
        r.raise_for_status()
        try:
            response_dict = r.json()
        except:
            raise Exception(r.content)
        if 'error' in response_dict:
            raise Exception(response_dict.error)
        self.account.credentials = r.json()
        self.account.save()
