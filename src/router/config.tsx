import type { RouteObject } from 'react-router-dom';
import OverviewPage from '@/pages/home/page';
import PharmaciesPage from '@/pages/pharmacies/page';
import PharmacyDetail from '@/pages/pharmacies/PharmacyDetails';
import SubscriptionsPage from '@/pages/subscriptions/page';
import SupportPage from '@/pages/support/page';
import ActivityPage from '@/pages/activity/page';
import SettingsPage from '@/pages/settings/page';
import LoginPage from '@/pages/auth/LoginPage';
import NotFound from '@/pages/NotFound';

const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  { path: '/', element: <OverviewPage /> },
  { path: '/pharmacies', element: <PharmaciesPage /> },
  { path: '/pharmacies/:id', element: <PharmacyDetail /> },
  { path: '/subscriptions', element: <SubscriptionsPage /> },
  { path: '/support', element: <SupportPage /> },
  { path: '/activity', element: <ActivityPage /> },
  { path: '/settings', element: <SettingsPage /> },
  { path: '*', element: <NotFound /> },
];

export default routes;
