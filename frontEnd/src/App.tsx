
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import PurchaseEntry from './pages/PurchaseEntry';
import IssueEntry from './pages/IssueEntry';
import Members from './pages/Members';
import Transactions from './pages/Transactions';
import Purchases from './pages/Purchases';
import Issues from './pages/Issues';
import Reports from './pages/Reports';
import AdvancedReports from './pages/AdvancedReports';
import Settings from './pages/Settings';
import IndentRequest from './pages/IndentRequest';
import IndentRequests from './pages/IndentRequests';
import LoginUsers from './pages/LoginUsers';
import NotFound from './pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute>
                    <Inventory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/purchase-entry"
                element={
                  <ProtectedRoute>
                    <PurchaseEntry />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/issue-entry"
                element={
                  <ProtectedRoute>
                    <IssueEntry />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members"
                element={
                  <ProtectedRoute>
                    <Members />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/transactions"
                element={
                  <ProtectedRoute>
                    <Transactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/purchases"
                element={
                  <ProtectedRoute>
                    <Purchases />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/issues"
                element={
                  <ProtectedRoute>
                    <Issues />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/advanced-reports"
                element={
                  <ProtectedRoute>
                    <AdvancedReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/indent-request"
                element={
                  <ProtectedRoute>
                    <IndentRequest />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/indent-requests"
                element={
                  <ProtectedRoute>
                    <IndentRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login-users"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <LoginUsers />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
