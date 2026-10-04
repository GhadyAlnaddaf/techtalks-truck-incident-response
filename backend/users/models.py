from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        TRUCK_DRIVER = 'truck_driver', 'Truck Driver'
        DISPATCHER = 'dispatcher', 'Dispatcher'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.TRUCK_DRIVER
    )

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
