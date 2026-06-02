import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { BookingDetailPage } from '@/pages/BookingDetailPage';
import { BookingsPage } from '@/pages/BookingsPage';
import { BusinessProfileDetailPage } from '@/pages/BusinessProfileDetailPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { EventsPage } from '@/pages/EventsPage';
import { BusinessProfilesPage } from '@/pages/BusinessProfilesPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { GovernoratesPage } from '@/pages/GovernoratesPage';
import { LoginPage } from '@/pages/LoginPage';
import { RatingsPage } from '@/pages/RatingsPage';
import { ReportDetailPage } from '@/pages/ReportDetailPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { UserReportDetailPage } from '@/pages/UserReportDetailPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { UsersPage } from '@/pages/UsersPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/business-profiles" element={<BusinessProfilesPage />} />
          <Route path="/business-profiles/:id" element={<BusinessProfileDetailPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/governorates" element={<GovernoratesPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/bookings/:id" element={<BookingDetailPage />} />
          <Route path="/ratings" element={<RatingsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/user/:id" element={<UserReportDetailPage />} />
          <Route path="/reports/:id" element={<ReportDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
