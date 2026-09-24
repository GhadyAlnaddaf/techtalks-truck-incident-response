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

    # Stores the contact's phone number directly on the incident row.
    assistance_contact_phone = models.CharField(
        max_length=50,
        blank=True,
        default=''
    )

    def save(self, *args, **kwargs):
        if self.assigned_assistance_contact:
            self.assistance_contact_phone = self.assigned_assistance_contact.phone
        else:
            self.assistance_contact_phone = ''

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.truck_id} - {self.status}"


class IncidentHistory(models.Model):
    """
    Stores a permanent history of important events that happen
    during the lifecycle of an incident.
    """

    EVENT_TYPES = [
        ('CREATED', 'Incident Created'),
        ('STATUS_CHANGED', 'Status Changed'),
        ('ASSISTANCE_ASSIGNED', 'Assistance Assigned'),
        ('RESOLVED', 'Incident Resolved'),
    ]

    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name='history'
    )

    event_type = models.CharField(
        max_length=50,
        choices=EVENT_TYPES
    )

    details = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.incident.truck_id} - {self.event_type} - {self.created_at}"