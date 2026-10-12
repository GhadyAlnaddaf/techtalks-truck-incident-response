"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from incidents.views import (
    create_incident,
    get_incidents,
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

    path("api/auth/csrf/", csrf_token),
    path("api/auth/login/", login_user),
    path("api/auth/register/", register_user),
    path("api/auth/me/", current_user),
    path("api/auth/logout/", logout_user),

    path("api/incidents/", create_incident),
    path("api/incidents/list/", get_incidents),
    path("api/incidents/<int:incident_id>/", get_incident),
    path("api/incidents/<int:incident_id>/status/", status_update),
    path("api/incidents/<int:incident_id>/assistance/", assistance_update),
    path("api/incidents/<int:incident_id>/history/", get_incident_history),
]
