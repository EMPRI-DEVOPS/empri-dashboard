from django.db import models
from django.conf import settings
from django.shortcuts import reverse

import requests


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

    def get_absolute_url(self):
        return reverse("accounts:detail", kwargs={"pk": self.pk})

    def do_taiga_auth(self, credentials: dict):
        auth_url = credentials['url']+"/api/v1/auth"
        r = requests.post(auth_url, data={
                          'username': credentials['username'], 'password': credentials['password'], 'type': 'normal'})
        r.raise_for_status()
        return r.json()
