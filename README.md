# Truck Incident Response Platform (Yala Rescue)

A mobile-friendly web application for reporting truck incidents, coordinating assistance, and managing incident resolution.

## Project Overview

The **Truck Incident Response Platform** is a web application designed to improve communication between truck drivers and dispatchers when incidents occur during transportation.

Truck drivers can register, log in, and report incidents. Dispatchers can access a centralized dashboard to monitor unresolved incidents, assign assistance contacts, update incident statuses, and review resolved incidents through incident history.

The platform provides a structured workflow for managing incidents from initial reporting to final resolution.

## Problem Statement

Truck drivers may experience incidents during their trips, including:

- Vehicle breakdowns
- Road accidents
- Mechanical problems
- Other transportation-related issues

Managing these incidents through phone calls and messaging applications can make it difficult to coordinate assistance, track incident progress, and maintain an organized record of resolutions.

## Proposed Solution

The platform provides a centralized incident management system that connects truck drivers with dispatchers.

Truck drivers can submit incident reports containing truck details, location, and a description of the problem. Each report is associated with the authenticated user's account.

Dispatchers can review unresolved incidents, assign assistance contacts, monitor status updates, and manage incident resolution. Once an incident is resolved, it is displayed in the incident history for reference.

## Target Users

- **Truck Drivers:** Register, log in, and report truck incidents.
- **Dispatchers:** Monitor unresolved incidents, assign assistance contacts, update incident statuses, and review resolved incidents.

## Implemented MVP Features

### 1. Authentication and Role-Based Access

- User registration and login.
- Secure session-based authentication.
- Role-based access for Truck Drivers and Dispatchers.
- Automatic redirection based on the authenticated user's role.
- Protected routes and access restrictions.
- Logout functionality.
- Validation and error handling for authentication requests.

### 2. Incident Reporting

- Submit truck incident reports.
- Provide truck identification details.
- Specify the incident location.
- Describe the incident.
- Associate incident reports with the logged-in user's account.
- Store the reporter's identity and account information for dispatcher reference.

### 3. Dispatcher Dashboard

- View and manage unresolved incidents.
- Display incident information, including truck details, location, status, reporter information, assistance contact, and creation timestamp.
- Assign assistance contacts to reported incidents.
- Automatically change the incident status to **Assigned** when an assistance contact is assigned.
- Update incident statuses as the response progresses.
- Manage incidents through their resolution.

### 4. Incident Status Management

Incidents follow a defined status workflow:

- **Pending:** The incident has been reported and is awaiting assistance assignment.
- **Assigned:** An assistance contact has been assigned.
- **On the way:** The assigned assistance contact is traveling to the incident location.
- **In progress:** Assistance or incident handling is underway.
- **Resolved:** The incident has been resolved.

### 5. Incident History

- Display resolved incidents separately from active incidents.
- Maintain a record of incident history events.
- Track incident creation and status changes.
- Record assistance assignment and resolution-related events where applicable.
- Preserve timestamps for incident tracking and accountability.

### 6. Access Control and Incident Visibility

- Truck Drivers can access incident reporting functionality.
- Dispatchers can access the dispatcher dashboard and incident history.
- Unauthorized users are prevented from accessing protected functionality.
- The dispatcher dashboard displays unresolved incidents only.
- Incident History displays resolved incidents only.

## Technology Stack

### Frontend

- **React** — Building the user interface and reusable components.
- **Vite** — Frontend development server and build tooling.
- **JavaScript** — Application logic and API integration.
- **React Router** — Client-side routing and navigation.

### Backend

- **Python** — Backend programming language.
- **Django** — Backend framework and application logic.
- **Django REST-style API endpoints** — Handling incident management, authentication, and frontend integration.
- **Session-based authentication and CSRF protection** — Managing authenticated requests securely.

### Database

- **PostgreSQL** — Relational database.
- **Django ORM** — Database models, queries, and migrations.

### Development and Collaboration Tools

- **Git** — Version control.
- **GitHub** — Source code hosting and pull requests.
- **Jira** — Sprint planning, task management, and progress tracking.
- **Visual Studio Code** — Development environment.
- **Postman or equivalent API testing tools** — API verification, where used.

## Project Architecture

The application follows a frontend-backend architecture:

1. The React frontend provides the user interface for truck drivers and dispatchers.
2. The Django backend processes API requests, applies business rules, and enforces authentication and authorization.
3. PostgreSQL stores application data, including users, incidents, assistance contacts, and incident history.
4. The frontend communicates with the backend through HTTP requests to the API endpoints.

```text
Truck Drivers / Dispatchers
            |
            v
     React + Vite
       Frontend
            |
            v
       Django API
   Authentication & Logic
            |
            v
       PostgreSQL
         Database
```

## Getting Started

### Prerequisites

Install the following before running the application:

- Python
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/GhadyAlnaddaf/techtalks-truck-incident-response.git
cd techtalks-truck-incident-response
```

### 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a Python virtual environment.

**Windows:**

```bash
python -m venv venv
venv\Scripts\activate
```

Install the backend dependencies:

```bash
pip install -r requirements.txt
```

Configure the Django environment variables and PostgreSQL database connection according to the project's settings.

Apply database migrations:

```bash
python manage.py migrate
```

Create a Django superuser if administrative access is needed:

```bash
python manage.py createsuperuser
```

Start the backend server:

```bash
python manage.py runserver
```

The backend will normally be available at:

`http://127.0.0.1:8000/`

### 3. Configure the Frontend

Open a separate terminal and navigate to the frontend directory from the repository root:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, typically:

`http://localhost:5173/`

**Note:** Ensure that the frontend API configuration, Django CORS settings, CSRF settings, and database credentials match your local environment. Use the project's actual dependency files and configuration when setting up the application.

## API Overview

The backend exposes endpoints for authentication and incident management.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/auth/csrf/` | Obtain a CSRF token |
| POST | `/api/auth/login/` | Authenticate a user |
| GET | `/api/auth/me/` | Retrieve the current authenticated user |
| POST | `/api/auth/logout/` | Log out the current user |
| POST | `/api/incidents/` | Create an incident report |
| GET | `/api/incidents/list/` | Retrieve incident records |
| GET | `/api/incidents/<incident_id>/` | Retrieve a specific incident |
| PATCH | `/api/incidents/<incident_id>/status/` | Update an incident status |
| PATCH | `/api/incidents/<incident_id>/assistance/` | Assign or update an assistance contact |

**Access control:** Protected endpoints require the appropriate authentication and permissions. Exact response formats and filtering behavior depend on the backend implementation.

## Development Workflow

The team uses GitHub for source control and Jira for sprint planning and task tracking.

### Branching Strategy

Features and fixes are developed on separate branches before being merged into the main branch through pull requests.

Example:

```text
main
 ├── feature/incident-report
 ├── feature/dispatcher-dashboard
 ├── feature/incident-history
 ├── feature/authentication
 └── feature/frontend-backend-integration
```

### Collaboration Process

1. Create or select a Jira task.
2. Create a feature branch from the appropriate base branch.
3. Implement the assigned feature or fix.
4. Test the changes and verify integration.
5. Commit and push the changes to GitHub.
6. Open a pull request for review.
7. Merge the changes after review and verification.

## Testing and Verification

The team verifies the application's functionality through appropriate frontend, backend, API, and integration testing.

Key verification areas include:

- User registration, login, and logout.
- Authentication persistence and protected routes.
- Role-based access for Truck Drivers and Dispatchers.
- Incident creation and reporter association.
- Automatic status transition when assistance is assigned.
- Incident status updates and resolution.
- Separation of unresolved incidents and resolved incident history.
- API integration and database persistence.
- Validation and error handling.

## MVP Scope and Limitations

The completed MVP focuses on incident reporting, dispatcher coordination, role-based access, and incident history.

The following advanced capabilities are outside the current MVP scope:

- Automatic emergency dispatch.
- AI-based incident detection or classification.
- Automatic assistance selection.
- Advanced real-time GPS tracking.
- Route optimization.
- Advanced analytics and predictive maintenance.

These features may be considered for future development.

## Team

The project was developed collaboratively as part of the TechTalks internship project.

| Team Member | Responsibility |
|---|---|
| Ghady Alnaddaf | Project coordination and frontend backend Integration |
| Mohamad Sayed Ahmad | Frontend development |
| Zeinab El Hawrani | Backend development |
| Jana Mais | Database development |
| Salam Shaib | Frontend development |


## Future Improvements

Potential improvements beyond the MVP include:

- Real-time notifications for incident updates.
- GPS-based location sharing.
- Photo attachments for incident reports, if not yet fully integrated.
- More detailed reporting and analytics.
- Automated assistance recommendations.
- Improved audit logs and operational monitoring.

## Conclusion

The Truck Incident Response Platform provides a centralized solution for reporting truck incidents and coordinating dispatcher assistance. By combining authentication, role-based access, incident status management, assistance assignment, and incident history, the completed MVP establishes a structured workflow from incident reporting to resolution.

The project also demonstrates practical experience with full-stack development, REST API integration, relational database management, version control, and collaborative Agile development.
