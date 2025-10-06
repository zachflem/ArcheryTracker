import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import MainLayout from './components/common/MainLayout';
import AdminLayout from './components/admin/AdminLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import UsersAdmin from './pages/admin/UsersAdmin';
import ClubsAdmin from './pages/admin/ClubsAdmin';
import Dashboard from './pages/Dashboard';
import Clubs from './pages/Clubs';
import ClubDetails from './pages/ClubDetails';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Rounds from './pages/Rounds';
import RoundDetails from './pages/RoundDetails';
import NewRound from './pages/NewRound';
import ScoringPage from './pages/ScoringPage';
import ClubManagement from './pages/ClubManagement';
import Profile from './pages/Profile';
import QRCode from './pages/QRCode';
import NotFound from './pages/NotFound';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Route
      {...rest}
      render={props =>
        loading ? (
          <div>Loading...</div>
        ) : isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

function AppRoutes() {
  return (
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected Routes */}
      <ProtectedRoute 
        path="/dashboard" 
        component={props => (
          <MainLayout>
            <Dashboard {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/clubs" 
        exact
        component={props => (
          <MainLayout>
            <Clubs {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/clubs/new" 
        exact
        component={props => (
          <MainLayout>
            <ClubManagement {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/clubs/edit/:name" 
        exact
        component={props => (
          <MainLayout>
            <ClubManagement {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/clubs/:name" 
        exact
        component={props => (
          <MainLayout>
            <ClubDetails {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/courses" 
        exact
        component={props => (
          <MainLayout>
            <Courses {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/courses/:id" 
        component={props => (
          <MainLayout>
            <CourseDetails {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/rounds" 
        exact
        component={props => (
          <MainLayout>
            <Rounds {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/rounds/new" 
        component={props => (
          <MainLayout>
            <NewRound {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/rounds/:id" 
        exact
        component={props => (
          <MainLayout>
            <RoundDetails {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/rounds/:id/score" 
        component={props => (
          <MainLayout fullWidth={true}>
            <ScoringPage {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/profile" 
        component={props => (
          <MainLayout>
            <Profile {...props} />
          </MainLayout>
        )} 
      />
      
      <ProtectedRoute 
        path="/qrcode" 
        component={props => (
          <MainLayout>
            <QRCode {...props} />
          </MainLayout>
        )} 
      />
      
      {/* Admin Routes */}
      <ProtectedRoute
        path="/admin/users"
        component={props => (
          <AdminLayout 
            title="User Management" 
            description="Manage users, roles, and permissions"
            requiredRole={['super_user', 'admin']}
          >
            <UsersAdmin {...props} />
          </AdminLayout>
        )}
      />
      
      <ProtectedRoute
        path="/admin/clubs"
        component={props => (
          <AdminLayout 
            title="Club Management" 
            description="Manage club details, members, courses, and events"
            requiredRole={['super_user', 'admin', 'club_admin']}
          >
            <ClubsAdmin {...props} />
          </AdminLayout>
        )}
      />
      
      <ProtectedRoute
        path="/admin/system"
        component={props => (
          <AdminLayout 
            title="System Settings" 
            description="Configure system-wide settings"
            requiredRole={['super_user']}
          >
            <div>System settings functionality will be implemented soon</div>
          </AdminLayout>
        )}
      />
      
      <ProtectedRoute
        path="/admin/backups"
        component={props => (
          <AdminLayout 
            title="Backup & Restore" 
            description="Manage system backups and restoration"
            requiredRole={['super_user', 'admin']}
          >
            <div>Backup management functionality will be implemented soon</div>
          </AdminLayout>
        )}
      />
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="top-center" />
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
