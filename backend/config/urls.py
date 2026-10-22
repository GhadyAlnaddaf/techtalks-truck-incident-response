
from django.contrib import admin
from django.urls import path

from incidents.views import (
    create_incident,
    get_incidents,
    get_resolved_incidents,
    get_incident,
    status_update,
    assistance_update,
    get_incident_history,
    csrf_token,
    login_user,
    current_user,
    logout_user,
)
from users.views import register_user


urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication
    path("api/auth/csrf/", csrf_token),
    path("api/auth/login/", login_user),
    path("api/auth/register/", register_user),
    path("api/auth/me/", current_user),
    path("api/auth/logout/", logout_user),

    # Incidents
    path("api/incidents/", create_incident),
    path("api/incidents/list/", get_incidents),
    path("api/incidents/resolved/", get_resolved_incidents),
    path("api/incidents/<int:incident_id>/", get_incident),
    path("api/incidents/<int:incident_id>/status/", status_update),
    path("api/incidents/<int:incident_id>/assistance/", assistance_update),
    path("api/incidents/<int:incident_id>/history/", get_incident_history),
]
