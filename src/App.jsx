import { Route, Routes } from 'react-router-dom'
import AuthGuard from './components/AuthGuard'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import InternalDashboardPage from './pages/InternalDashboardPage'
import InternalHomePage from './pages/InternalHomePage'
import DashboardModePage from './pages/DashboardModePage'
import InitiativesHubPage from './pages/InitiativesHubPage'
import MonthlyBirthdaysPage from './pages/MonthlyBirthdaysPage'
import MonthlyBirthdaysManagementPage from './pages/MonthlyBirthdaysManagementPage'
import ProjectManagementPage from './pages/ProjectManagementPage'
import ProjectDashboardPage from './pages/ProjectDashboardPage'
import NewProjectCreationPage from './pages/NewProjectCreationPage'
import ManageProjectsPage from './pages/ManageProjectsPage'
import InternalNewRequestPage from './pages/InternalNewRequestPage'
import LoginSuccessPage from './pages/LoginSuccessPage'
import ExternalDashboardPage from './pages/ExternalDashboardPage'
import ExternalRequestPage from './pages/ExternalRequestPage'
import UsersPage from './pages/UsersPage'
import OurMissionPage from './pages/OurMissionPage'
import SupportPage from './pages/SupportPage'
import { GROUPS } from './auth/auth.constants.js'
import RequestDetailPage from './pages/RequestDetailPage'
import FirstAccessPage from './pages/FirstAccessPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import './styles/app.css'

function App() {
  return (
    <div className="app">
      <Navigation />
      <main className="app__content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/first-access" element={<FirstAccessPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/internal-home"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <InternalHomePage />
              </AuthGuard>
            }
          />
          <Route
            path="/dashboard-mode"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <DashboardModePage />
              </AuthGuard>
            }
          />
          <Route path="/mission" element={<OurMissionPage />} />
          <Route
            path="/initiatives-hub"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <InitiativesHubPage />
              </AuthGuard>
            }
          />
          <Route
            path="/monthly-birthdays"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <MonthlyBirthdaysPage />
              </AuthGuard>
            }
          />
          <Route
            path="/monthly-birthdays-management"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <MonthlyBirthdaysManagementPage />
              </AuthGuard>
            }
          />
          <Route
            path="/project-management"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <ProjectManagementPage />
              </AuthGuard>
            }
          />
          <Route
            path="/project-dashboard"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <ProjectDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="/new-project-creation"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <NewProjectCreationPage />
              </AuthGuard>
            }
          />
          <Route
            path="/manage-projects"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <ManageProjectsPage />
              </AuthGuard>
            }
          />
          <Route path="/support" element={<SupportPage />} />
          <Route
            path="/welcome"
            element={
              <AuthGuard>
                <LoginSuccessPage />
              </AuthGuard>
            }
          />
          <Route
            path="/internal-dashboard"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <InternalDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="/internal-requests/new"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <InternalNewRequestPage />
              </AuthGuard>
            }
          />
          <Route
            path="/external-dashboard"
            element={
              <AuthGuard allowedGroups={[GROUPS.EXTERNAL, GROUPS.ADMIN]}>
                <ExternalDashboardPage />
              </AuthGuard>
            }
          />
          <Route
            path="/external-requests/:requestId"
            element={
              <AuthGuard allowedGroups={[GROUPS.EXTERNAL, GROUPS.ADMIN]}>
                <ExternalRequestPage />
              </AuthGuard>
            }
          />
          <Route
            path="/requests/:supplierID/:partNumberVersion"
            element={
              <AuthGuard allowedGroups={[GROUPS.INTERNAL, GROUPS.ADMIN]}>
                <RequestDetailPage />
              </AuthGuard>
            }
          />
          <Route
            path="/users"
            element={
              <AuthGuard>
                <UsersPage />
              </AuthGuard>
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App





