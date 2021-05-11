from django.contrib.auth.models import AbstractBaseUser
from django.db import models
from django.utils import timezone
from timezone_field import TimeZoneField

from .managers import UserManager


def default_day_time_ranges():
    return [
        6, 9, 12, 15, 18
    ]


class User(AbstractBaseUser):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=40, unique=True)
    time_zone = TimeZoneField(default='Europe/Berlin')
    date_joined = models.DateTimeField(default=timezone.now)
    day_time_ranges = models.JSONField(default=default_day_time_ranges)
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.username
