import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AppShell from "./components/AppShell";
import LoginPage from "./features/auth/LoginPage";
import { ROLES } from "./features/auth/roles";
import { getCurrentUser, loginUser, logoutUser } from "./features/auth/authApi";

import IncidentReportForm from "./features/incidents/IncidentReportForm";
import DispatcherDashboard from "./DispatcherDashboard";
import IncidentHistory from "./features/incidents/IncidentHistory";

function ProtectedRoute({ user, children }) {
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function RoleRoute({ user, role, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    if (user.role === ROLES.DISPATCHER) {
      return <Navigate to="/dispatcher" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

function AuthenticatedShell({ user, setUser, children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <AppShell role={user.role} onLogout={handleLogout}>
      {children}
    </AppShell>
  );
}

function LoginPageWrapper({ setUser }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async ({ identifier, password }) => {
    setError(null);
    setLoading(true);

    try {
      const authenticatedUser = await loginUser(identifier, password);

      setUser(authenticatedUser);

      if (authenticatedUser.role === ROLES.DISPATCHER) {
        navigate("/dispatcher", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      setError(error.message || "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return <LoginPage onSubmit={handleSubmit} loading={loading} error={error} />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Failed to restore authentication:", error);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    restoreSession();
  }, []);

  if (loadingUser) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={
            user ? (
              user.role === ROLES.DISPATCHER ? (
                <Navigate to="/dispatcher" replace />
              ) : (
                <Navigate to="/" replace />
              )
            ) : (
              <LoginPageWrapper setUser={setUser} />
            )
          }
        />

        {/* TRUCK DRIVER */}
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
              <RoleRoute user={user} role={ROLES.TRUCK_DRIVER}>
                <AuthenticatedShell user={user} setUser={setUser}>
                  <IncidentReportForm />
                </AuthenticatedShell>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* DISPATCHER DASHBOARD */}
        <Route
          path="/dispatcher"
          element={
            <ProtectedRoute user={user}>
              <RoleRoute user={user} role={ROLES.DISPATCHER}>
                <AuthenticatedShell user={user} setUser={setUser}>
                  <DispatcherDashboard />
                </AuthenticatedShell>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* INCIDENT HISTORY */}
        <Route
          path="/history"
          element={
            <ProtectedRoute user={user}>
              <RoleRoute user={user} role={ROLES.DISPATCHER}>
                <AuthenticatedShell user={user} setUser={setUser}>
                  <IncidentHistory />
                </AuthenticatedShell>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* UNKNOWN URL */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                user
                  ? user.role === ROLES.DISPATCHER
                    ? "/dispatcher"
                    : "/"
                  : "/login"
              }
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
