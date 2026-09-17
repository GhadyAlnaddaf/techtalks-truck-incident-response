import json

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Incident


def home(request):
    return JsonResponse({
        "message": "Django API is running"
    })


field_names = {
    "truck_id": "Truck ID",
    "location": "Location",
    "description": "Description",
}
VALID_STATUSES = [
    "Pending",
    "Assigned",
    "On the way",
    "In progress",
    "Resolved",
]

@csrf_exempt
def create_incident(request):
    if request.method != "POST":
        return JsonResponse(
            {
                "message": "Only POST requests are allowed"
            },
            status=405,
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {
                "message": "Invalid JSON"
            },
            status=400,
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {
                "message": "JSON data must be an object"
            },
            status=400,
        )

    required_fields = [
        "truck_id",
        "location",
        "description",
    ]

    # Check that all required fields exist
    for key in required_fields:
        if key not in data:
            return JsonResponse(
                {
                    "message": f"{field_names[key]} is missing"
                },
                status=400,
            )

    # Check that all required fields are strings and not empty
    for key in required_fields:
        if not isinstance(data[key], str):
            return JsonResponse(
                {
                    "message": f"{field_names[key]} must be a string"
                },
                status=400,
            )

        if data[key].strip() == "":
            return JsonResponse(
                {
                    "message": f"{field_names[key]} cannot be empty"
                },
                status=400,
            )

    # Clean whitespace
    truck_id = data["truck_id"].strip()
    location = data["location"].strip()
    description = data["description"].strip()

    # Maximum length validation
    if len(truck_id) > 255:
        return JsonResponse(
            {
                "message": "Truck ID must be 255 characters or fewer"
            },
            status=400,
        )

    if len(location) > 255:
        return JsonResponse(
            {
                "message": "Location must be 255 characters or fewer"
            },
            status=400,
        )

    # Create the incident
    incident = Incident.objects.create(
        truck_id=truck_id,
        location=location,
        description=description,
    )

    print(
        f"Incident created: "
        f"id={incident.id}, "
        f"truck_id={incident.truck_id}, "
        f"status={incident.status}"
    )

    return JsonResponse(
        {
            "message": "Incident created successfully",
            "incident": {
                "id": incident.id,
                "truck_id": incident.truck_id,
                "location": incident.location,
                "description": incident.description,
                "status": incident.status,
                "created_at": incident.created_at.isoformat(),
                "updated_at": incident.updated_at.isoformat(),
            },
        },
        status=201,
    )
def get_incidents(request):
    if request.method != "GET":
        return JsonResponse(
            {
                "message": "Only GET requests are allowed"
            },
            status=405,
        )

    incidents = Incident.objects.all().order_by("-created_at")

    incidents_data = []

    for incident in incidents:
        incidents_data.append(
            {
                "id": incident.id,
                "truck_id": incident.truck_id,
                "location": incident.location,
                "description": incident.description,
                "status": incident.status,
                "created_at": incident.created_at.isoformat(),
                "updated_at": incident.updated_at.isoformat(),
            }
        )

    return JsonResponse(
        {
            "incidents": incidents_data
        },
        status=200,
    )

def get_incident(request,incident_id):

    if request.method != "GET":
        return JsonResponse(
        {"message": "Only GET requests are allowed"},
        status=405,
        )
    try:
        incident=Incident.objects.get(id=incident_id)
    except Incident.DoesNotExist:
        return JsonResponse(
            {"message": "Incident ID not found"},
            status=404,
        )
    return JsonResponse(
        {
            "id": incident.id,
            "truck_id": incident.truck_id,
            "location": incident.location,
            "description": incident.description,
            "status": incident.status,
            "created_at": incident.created_at.isoformat(),
            "updated_at": incident.updated_at.isoformat(),
        },
        status=200,
    )
@csrf_exempt
def status_update(request,incident_id):
    if request.method != "PATCH":
        return JsonResponse(
            {
                "message": "Only PATCH requests are allowed"
            },
            status=405,
        )
    try:
        data=json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {
                "message":"Invalid JSON"
            },
            status=400,
        )
    if not isinstance(data, dict):
        return JsonResponse(
            {"message": "JSON data must be an object"},
            status=400,
        )

    if ("status" not in data ):
        return JsonResponse(
            {
                "message":"Status is missing"
            },
            status=400,
        )
    new_status=data["status"]
    if not isinstance(new_status,str):
        return JsonResponse(
            {
                "message":"Status must be a string"
            },
            status=400,
        )

    if new_status not in VALID_STATUSES:
        return JsonResponse(
            {
                "message": "Invalid status"
            },
            status=400,
        )

    try:
        incident = Incident.objects.get(id=incident_id)
    except Incident.DoesNotExist:
        return JsonResponse(
            {
                "message": "Incident ID not found"
            },
            status=404,
        )

    incident.status = new_status
    incident.save()

    return JsonResponse(
        {
            "message": "Incident status updated successfully",
            "incident": {
                "id": incident.id,
                "truck_id": incident.truck_id,
                "location": incident.location,
                "description": incident.description,
                "status": incident.status,
                "created_at": incident.created_at.isoformat(),
                "updated_at": incident.updated_at.isoformat(),
            },
        },
        status=200,
    )
