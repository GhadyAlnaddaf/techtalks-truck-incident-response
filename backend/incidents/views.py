
import json

from django.contrib.auth import authenticate, login, logout, get_user_model
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import AssistanceContact, Incident, IncidentHistory


User = get_user_model()


def get_user_role(user):
    if not hasattr(user, "role"):
        return None

    return user.get_role_display()


def require_authentication(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"message": "Authentication required"},
            status=401,
        )

    return None


def require_dispatcher(request):
    auth_error = require_authentication(request)

    if auth_error:
        return auth_error

    if request.user.role != User.Role.DISPATCHER:
        return JsonResponse(
            {"message": "Dispatcher access required"},
            status=403,
        )

    return None


def require_truck_driver(request):
    auth_error = require_authentication(request)

    if auth_error:
        return auth_error

    if request.user.role != User.Role.TRUCK_DRIVER:
        return JsonResponse(
            {"message": "Truck Driver access required"},
            status=403,
        )

    return None


VALID_STATUSES = [
    "Pending",
    "Assigned",
    "On the way",
    "In progress",
    "Resolved",
]

UNRESOLVED_STATUSES = [
    "Pending",
    "Assigned",
    "On the way",
    "In progress",
]


@ensure_csrf_cookie
def csrf_token(request):
    if request.method != "GET":
        return JsonResponse(
            {"message": "Only GET requests are allowed"},
            status=405,
        )

    return JsonResponse(
        {"csrfToken": get_token(request)},
        status=200,
    )


def login_user(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Only POST requests are allowed"},
            status=405,
        )

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"message": "Invalid JSON"}, status=400)

    if not isinstance(data, dict):
        return JsonResponse(
            {"message": "JSON data must be an object"},
            status=400,
        )

    identifier = data.get("identifier")
    password = data.get("password")

    if not isinstance(identifier, str) or not identifier.strip():
        return JsonResponse(
            {"message": "Username or email is required"},
            status=400,
        )

    if not isinstance(password, str) or not password:
        return JsonResponse(
            {"message": "Password is required"},
            status=400,
        )

    identifier = identifier.strip()
    username = identifier

    if "@" in identifier:
        users = User.objects.filter(email__iexact=identifier)

        if users.count() != 1:
            return JsonResponse(
                {"message": "Invalid username/email or password"},
                status=401,
            )

        username = users.first().get_username()

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None:
        return JsonResponse(
            {"message": "Invalid username/email or password"},
            status=401,
        )

    login(request, user)

    return JsonResponse(
        {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.get_username(),
                "email": user.email,
                "role": get_user_role(user),
            },
        },
        status=200,
    )


def current_user(request):
    if request.method != "GET":
        return JsonResponse(
            {"message": "Only GET requests are allowed"},
            status=405,
        )

    if not request.user.is_authenticated:
        return JsonResponse(
            {"message": "Authentication required"},
            status=401,
        )

    user = request.user

    return JsonResponse(
        {
            "user": {
                "id": user.id,
                "username": user.get_username(),
                "email": user.email,
                "role": get_user_role(user),
            }
        },
        status=200,
    )


def logout_user(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Only POST requests are allowed"},
            status=405,
        )

    if not request.user.is_authenticated:
        return JsonResponse(
            {"message": "Authentication required"},
            status=401,
        )

    logout(request)

    return JsonResponse(
        {"message": "Logout successful"},
        status=200,
    )


def home(request):
    return JsonResponse({"message": "Django API is running"})


def incident_to_dict(incident):
    assistance_contact = incident.assigned_assistance_contact
    reporting_user = incident.reporting_user

    return {
        "id": incident.id,
        "truck_id": incident.truck_id,
        "location": incident.location,
        "description": incident.description,
        "status": incident.status,
        "created_at": incident.created_at.isoformat(),
        "updated_at": incident.updated_at.isoformat(),
        "reporting_user": (
            {
                "id": reporting_user.id,
                "username": reporting_user.get_username(),
                "email": reporting_user.email,
            }
            if reporting_user
            else None
        ),
        "assigned_assistance_contact": (
            {
                "id": assistance_contact.id,
                "name": assistance_contact.name,
                "phone": assistance_contact.phone,
                "email": assistance_contact.email,
            }
            if assistance_contact
            else None
        ),
    }


def create_incident(request):
    permission_error = require_truck_driver(request)

    if permission_error:
        return permission_error

    if request.method != "POST":
        return JsonResponse(
            {"message": "Only POST requests are allowed"},
            status=405,
        )

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"message": "Invalid JSON"}, status=400)

    if not isinstance(data, dict):
        return JsonResponse(
            {"message": "JSON data must be an object"},
            status=400,
        )

    required_fields = ["truck_id", "location", "description"]

    for key in required_fields:
        if key not in data:
            return JsonResponse(
                {"message": f"{key.replace('_', ' ').title()} is missing"},
                status=400,
            )

        if not isinstance(data[key], str):
            return JsonResponse(
                {
                    "message": (
                        f"{key.replace('_', ' ').title()} must be a string"
                    )
                },
                status=400,
            )

        if not data[key].strip():
            return JsonResponse(
                {
                    "message": (
                        f"{key.replace('_', ' ').title()} cannot be empty"
                    )
                },
                status=400,
            )

    truck_id = data["truck_id"].strip()
    location = data["location"].strip()
    description = data["description"].strip()

    if len(truck_id) > 255:
        return JsonResponse(
            {"message": "Truck ID must be 255 characters or fewer"},
            status=400,
        )

    if len(location) > 255:
        return JsonResponse(
            {"message": "Location must be 255 characters or fewer"},
            status=400,
        )

    incident = Incident.objects.create(
        truck_id=truck_id,
        location=location,
        description=description,
        reporting_user=request.user,
    )

    IncidentHistory.objects.create(
        incident=incident,
        event_type="CREATED",
        details="Incident created",
    )

    return JsonResponse(
        {
            "message": "Incident created successfully",
            "incident": incident_to_dict(incident),
        },
        status=201,
    )


def get_incidents(request):
    permission_error = require_dispatcher(request)

    if permission_error:
        return permission_error

    if request.method != "GET":
        return JsonResponse(
            {"message": "Only GET requests are allowed"},
            status=405,
        )

    incidents = (
        Incident.objects
        .filter(status__in=UNRESOLVED_STATUSES)
        .select_related(
            "reporting_user",
            "assigned_assistance_contact",
        )
        .order_by("-created_at")
    )

    return JsonResponse(
        {
            "incidents": [
                incident_to_dict(incident)
                for incident in incidents
            ]
        },
        status=200,
    )


def get_resolved_incidents(request):
    permission_error = require_dispatcher(request)

    if permission_error:
        return permission_error

    if request.method != "GET":
        return JsonResponse(
            {"message": "Only GET requests are allowed"},
            status=405,
        )

    incidents = (
        Incident.objects
        .filter(status="Resolved")
        .select_related(
            "reporting_user",
            "assigned_assistance_contact",
        )
        .order_by("-updated_at")
    )

    return JsonResponse(
        {
            "incidents": [
                incident_to_dict(incident)
                for incident in incidents
            ]
        },
        status=200,
    )


def get_incident(request, incident_id):
    permission_error = require_dispatcher(request)

    if permission_error:
        return permission_error

    if request.method != "GET":
        return JsonResponse(
            {"message": "Only GET requests are allowed"},
            status=405,
        )

    try:
        incident = (
            Incident.objects
            .select_related(
                "reporting_user",
                "assigned_assistance_contact",
            )
            .get(id=incident_id)
        )
    except Incident.DoesNotExist:
        return JsonResponse(
            {"message": "Incident ID not found"},
            status=404,
        )

    return JsonResponse(incident_to_dict(incident), status=200)


def get_incident_history(request, incident_id):
    permission_error = require_dispatcher(request)

    if permission_error:
        return permission_error

    if request.method != "GET":
        return JsonResponse(
            {"message": "Only GET requests are allowed"},
            status=405,
        )

    try:
        incident = Incident.objects.get(id=incident_id)
    except Incident.DoesNotExist:
        return JsonResponse(
            {"message": "Incident ID not found"},
            status=404,
        )

    history = IncidentHistory.objects.filter(
        incident=incident
    ).order_by("created_at", "id")

    return JsonResponse(
        {
            "history": [
                {
                    "id": event.id,
                    "event_type": event.event_type,
                    "details": event.details,
                    "created_at": event.created_at.isoformat(),
                }
                for event in history
            ]
        },
        status=200,
    )


def status_update(request, incident_id):
    permission_error = require_dispatcher(request)

    if permission_error:
        return permission_error

    if request.method != "PATCH":
        return JsonResponse(
            {"message": "Only PATCH requests are allowed"},
            status=405,
        )

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"message": "Invalid JSON"}, status=400)

    if not isinstance(data, dict):
        return JsonResponse(
            {"message": "JSON data must be an object"},
            status=400,
        )

    new_status = data.get("status")

    if not isinstance(new_status, str):
        return JsonResponse(
            {"message": "Status is missing or must be a string"},
            status=400,
        )

    if new_status not in VALID_STATUSES:
        return JsonResponse({"message": "Invalid status"}, status=400)

    try:
        incident = Incident.objects.get(id=incident_id)
    except Incident.DoesNotExist:
        return JsonResponse(
            {"message": "Incident ID not found"},
            status=404,
        )

    incident.status = new_status
    incident.save()

    history_event_type = (
        "RESOLVED" if new_status == "Resolved" else "STATUS_CHANGED"
    )

    IncidentHistory.objects.create(
        incident=incident,
        event_type=history_event_type,
        details=f"Status changed to {new_status}",
    )

    incident.refresh_from_db()

    return JsonResponse(
        {
            "message": "Incident status updated successfully",
            "incident": incident_to_dict(incident),
        },
        status=200,
    )


def assistance_update(request, incident_id):
    permission_error = require_dispatcher(request)

    if permission_error:
        return permission_error

    if request.method != "PATCH":
        return JsonResponse(
            {"message": "Only PATCH requests are allowed"},
            status=405,
        )

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"message": "Invalid JSON"}, status=400)

    if not isinstance(data, dict):
        return JsonResponse(
            {"message": "JSON data must be an object"},
            status=400,
        )

    assistance_contact_id = data.get("assistance_contact_id")

    if (
        not isinstance(assistance_contact_id, int)
        or isinstance(assistance_contact_id, bool)
    ):
        return JsonResponse(
            {"message": "Contact ID must be an integer"},
            status=400,
        )

    try:
        incident = Incident.objects.get(id=incident_id)
    except Incident.DoesNotExist:
        return JsonResponse(
            {"message": "Incident ID not found"},
            status=404,
        )

    try:
        contact = AssistanceContact.objects.get(
            id=assistance_contact_id
        )
    except AssistanceContact.DoesNotExist:
        return JsonResponse(
            {"message": "Assistance contact not found"},
            status=404,
        )

    incident.assigned_assistance_contact = contact
    incident.status = "Assigned"
    incident.save()

    IncidentHistory.objects.create(
        incident=incident,
        event_type="ASSISTANCE_ASSIGNED",
        details=f"Assistance assigned to {contact.name}",
    )

    IncidentHistory.objects.create(
        incident=incident,
        event_type="STATUS_CHANGED",
        details="Status changed to Assigned",
    )

    incident.refresh_from_db()

    return JsonResponse(
        {
            "message": "Assistance assigned successfully",
            "incident": incident_to_dict(incident),
        },
        status=200,
    )
