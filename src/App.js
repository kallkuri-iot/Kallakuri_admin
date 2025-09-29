import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Layout
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import OrderRequests from './pages/OrderRequests/OrderRequests';
import DamageReports from './pages/DamageReports/DamageReports';
import NewDamageClaim from './pages/DamageClaims/NewDamageClaim';
import DamageClaimView from './pages/DamageClaims/DamageClaimView';
import Tasks from './pages/Tasks/Tasks';
import MarketingActivities from './pages/MarketingActivities/MarketingActivities';
import StaffActivity from './pages/StaffActivity/StaffActivity';
import GodownLogs from './pages/GodownLogs/GodownLogs';
import SalesInquiries from './pages/SalesInquiries/SalesInquiries';
import SalesInquiryDetail from './pages/SalesInquiries/SalesInquiryDetail';
import Reports from './pages/Reports/Reports';
import Distributors from './pages/Distributors/Distributors';
import DistributorDetails from './pages/Distributors/DistributorDetails';
import AddDistributor from './pages/Distributors/AddDistributor';
import AddRetailShop from './pages/Distributors/AddRetailShop';
import AddWholesaleShop from './pages/Distributors/AddWholesaleShop';
import PendingShops from './pages/Distributors/PendingShops';
import StaffPage from './pages/Staff';
import SubAdmins from './pages/SubAdmins/SubAdmins';
import EditDistributor from './pages/Distributors/EditDistributor';
import StaffActivityDetail from './pages/StaffActivity/StaffActivityDetail';
import RetailerShopActivityList from './pages/StaffActivity/RetailerShopActivityList';
import RetailerShopActivityDetail from './pages/StaffActivity/RetailerShopActivityDetail';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import StaffDistributorAssignments from './pages/StaffDistributorAssignments/StaffDistributorAssignments';

// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffa726', // Light orange as main color
      light: '#ffcc80', // Very light orange
      dark: '#fb8c00', // Slightly darker orange
    },
    secondary: {
      main: '#5c6bc0', // Indigo
    },
    background: {
      default: '#f9f9f9',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #ffcc80 0%, #ffb74d 50%, #ffa726 100%)',
          boxShadow: '0 4px 10px rgba(255, 152, 0, 0.15)',
          '&:hover': {
            background: 'linear-gradient(135deg, #ffb74d 0%, #ffa726 50%, #fb8c00 100%)',
            boxShadow: '0 6px 15px rgba(255, 152, 0, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // If still loading auth state, don't render anything yet
  if (loading) {
    return null;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/analytics" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="staff" element={<StaffPage />} />
                <Route path="order-requests" element={<OrderRequests />} />
                <Route path="damage-reports" element={<DamageReports />} />
                <Route path="damage-reports/:id" element={<DamageClaimView />} />
                <Route path="new-damage-claim" element={<NewDamageClaim />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="marketing-activities" element={<MarketingActivities />} />
                <Route path="staff-activity" element={<StaffActivity />} />
                <Route path="staff-activity/details/:staffId" element={<StaffActivityDetail />} />
                <Route path="staff-activity/details/:staffId/:distributorName" element={<StaffActivityDetail />} />
                <Route path="staff-activity/shop-activities" element={<RetailerShopActivityList />} />
                <Route path="staff-activity/detail/:activityId" element={<RetailerShopActivityDetail />} />
                <Route path="staff-activity/task/:taskId" element={<RetailerShopActivityDetail />} />
                <Route path="retailer-shop-activity" element={<RetailerShopActivityList />} />
                <Route path="retailer-shop-activity/:activityId" element={<RetailerShopActivityDetail />} />
                <Route path="distributors" element={<Distributors />} />
                <Route path="distributors/:id" element={<DistributorDetails />} />
                <Route path="distributors/add" element={<AddDistributor />} />
                <Route path="distributors/:id/edit" element={<EditDistributor />} />
                <Route path="distributors/:id/add-shop" element={<AddRetailShop />} />
                <Route path="distributors/:id/add-wholesale-shop" element={<AddWholesaleShop />} />
                <Route path="distributors/pending-shops" element={<PendingShops />} />
                <Route path="godown-logs" element={<GodownLogs />} />
                <Route path="sales-inquiries" element={<SalesInquiries />} />
                <Route path="sales-inquiries/:id" element={<SalesInquiryDetail />} />
                <Route path="reports" element={<Reports />} />
                <Route path="sub-admins" element={<SubAdmins />} />
                <Route path="analytics" element={<AnalyticsDashboard />} />
                <Route path="staff-assignments" element={<StaffDistributorAssignments />} />
              </Route>
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
