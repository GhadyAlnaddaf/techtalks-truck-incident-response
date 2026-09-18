from django.db import models


class AssistanceContact(models.Model):
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True)

    def __str__(self):
        return self.name


class Incident(models.Model):
    truck_id = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=50, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    assigned_assistance_contact = models.ForeignKey(
        AssistanceContact,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_incidents'
    )

    def __str__(self):
        return f"{self.truck_id} - {self.status}"