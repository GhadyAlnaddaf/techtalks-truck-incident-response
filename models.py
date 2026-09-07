from django.db import models

class Incident(models.Model):
    truck_details = models.CharField(max_length=255)
    incident_location = models.CharField(max_length=255)
    description = models.TextField()
    photo = models.ImageField(upload_to='incident_photos/', blank= True , null= True)
    status = models.CharField(max_length= 50,default= 'Pending' )
    created_at = models.DateTimeField(auto_now_add= True)
    
    def __str__(self):
        return f"{self.truck_details} - {self.status}"
