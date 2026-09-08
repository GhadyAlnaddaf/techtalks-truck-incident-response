from django.db import models

class Incident(models.Model):
  truck_id = models.CharField(max_length=255)
  location = models.CharField(max_length=255)
  description = models.TextField()
  reported_at = models.DateTimeField(blank=True, null=True)
  status = models.CharField(max_length=50, default='Pending')
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)
  
def __str__(self):
  return f"{self.truck_id} - {self.status}"
  
