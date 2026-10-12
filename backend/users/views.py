import json

from django.contrib.auth.validators import UnicodeUsernameValidator
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse


User = get_user_model()


def register_user(request):
    if request.method != "POST":
        return JsonResponse(
            {"message": "Only POST requests are allowed"},
            status=405,
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"message": "Invalid JSON"},
            status=400,
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"message": "JSON data must be an object"},
            status=400,
        )

    # users are not allowed to choose their own role
    if "role" in data:
        return JsonResponse(
            {"message": "Role cannot be assigned during registration"},
            status=400,
        )

    required_fields = ["username", "email", "password"]

    for field in required_fields:
        if field not in data:
            return JsonResponse(
                {"message": f"{field.title()} is missing"},
                status=400,
            )

    username = data["username"]
    email = data["email"]
    password = data["password"]

    if not isinstance(username, str) or username.strip() == "":
        return JsonResponse(
            {"message": "Username is required"},
            status=400,
        )

    if not isinstance(email, str) or email.strip() == "":
        return JsonResponse(
            {"message": "Email is required"},
            status=400,
        )

    if not isinstance(password, str) or password == "":
        return JsonResponse(
            {"message": "Password is required"},
            status=400,
        )

    username = username.strip()
    email = email.strip()
    username_validator = UnicodeUsernameValidator()

    try:
        username_validator(username)
    except ValidationError:
        return JsonResponse(
            {"message": "Invalid username"},
            status=400,
        )

    if len(username) > 150:
        return JsonResponse(
            {"message": "Username must be 150 characters or fewer"},
            status=400,
        )

    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse(
            {"message": "Invalid email address"},
            status=400,
        )

    if User.objects.filter(username__iexact=username).exists():
        return JsonResponse(
            {"message": "Username already exists"},
            status=400,
        )

    if User.objects.filter(email__iexact=email).exists():
        return JsonResponse(
            {"message": "Email already exists"},
            status=400,
        )

    # Temporary user so Django can compare the password
    # against username/email during password validation.
    new_user = User(
        username=username,
        email=email,
        role=User.Role.TRUCK_DRIVER,
    )

    try:
        validate_password(password, user=new_user)
    except ValidationError as error:
        return JsonResponse(
            {
                "message": "Invalid password",
                "errors": error.messages,
            },
            status=400,
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role=User.Role.TRUCK_DRIVER,
    )

    return JsonResponse(
        {
            "message": "Registration successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.get_role_display(),
            },
        },
        status=201,
    )


def update_user_role(request, user_id):
    if request.method != "PATCH":
        return JsonResponse(
            {"message": "Only PATCH requests are allowed"},
            status=405,
        )

    if not request.user.is_authenticated:
        return JsonResponse(
            {"message": "Authentication required"},
            status=401,
        )

    if not request.user.is_superuser:
        return JsonResponse(
            {"message": "Admin access required"},
            status=403,
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"message": "Invalid JSON"},
            status=400,
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"message": "JSON data must be an object"},
            status=400,
        )

    if "role" not in data:
        return JsonResponse(
            {"message": "Role is missing"},
            status=400,
        )

    role = data["role"]

    if not isinstance(role, str):
        return JsonResponse(
            {"message": "Role must be a string"},
            status=400,
        )

    valid_roles = [
        User.Role.TRUCK_DRIVER,
        User.Role.DISPATCHER,
    ]

    if role not in valid_roles:
        return JsonResponse(
            {"message": "Invalid role"},
            status=400,
        )

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse(
            {"message": "User not found"},
            status=404,
        )

    user.role = role
    user.save(update_fields=["role"])

    return JsonResponse(
        {
            "message": "User role updated successfully",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.get_role_display(),
            },
        },
        status=200,
    )
