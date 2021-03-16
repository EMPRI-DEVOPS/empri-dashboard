from django.db import models

class Account(models.Model):

    ToolType = models.TextChoices('ToolType', 'Taiga Github Mattermost')

    user = models.ForeignKey(
        'auth.User',
        on_delete=models.CASCADE
    )
    tool = models.CharField(max_length=10, choices=ToolType.choices)
    enabled = models.BooleanField(default=True)
    credentials = models.JSONField(blank=True, null=True)

    def __str__(self):
        return self.tool
