import json
from django.http import JsonResponse
from .models import Incident

field_names = {
    "truck_id": "Truck ID",
    "location": "Location",
    "description": "Description",
}

def create_incident(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                "message": "Invalid JSON"
            }, status=400)

        if not isinstance(data, dict):
            return JsonResponse({
                "message": "JSON data must be an object"
            }, status=400)

        
        required_fields=["truck_id","location","description"]

        
        for key in required_fields:
            if key not in data:
                return JsonResponse({
                    "message": f"{field_names[key]} is missing"
                }, status=400)

        for key in required_fields:
            if not isinstance(data[key], str):
                return JsonResponse({
                    "message": f"{field_names[key]} must be a string"
                }, status=400)

            if data[key].strip() == "":
                return JsonResponse({
                    "message": f"{field_names[key]} cannot be empty"
                }, status=400)

        data["truck_id"] = data["truck_id"].strip()
        data["location"] = data["location"].strip()
        data["description"] = data["description"].strip()

        if len(data["truck_id"])> 255:
            return JsonResponse({
                "message": f"{field_names['truck_id']} must be 255 characters or fewer"
                }, status=400)


        if len(data["location"]) > 255:
            return JsonResponse({
                    "message": f"{field_names['location']} must be 255 characters or fewer"
                }, status=400)
        
        incident= Incident(
            truck_id=data["truck_id"],
            location=data["location"],
            description=data["description"],
        )

        incident.save()

        return JsonResponse({
            "message": "Incident created successfully"
        }, status=201)
    
    return JsonResponse({
        "message": "Only POST requests are allowed"
    }, status=405)
