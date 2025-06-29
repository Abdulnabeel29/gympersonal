import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Page Components
import Home from "./pages/Home";
import Members from "./pages/Members";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import Staff from "./pages/Staff/Staff";
import Inventory from "./pages/Inventory";
import Enquiries from "./pages/Enquiries";
import Finances from "./pages/Finances";
import AddFinance from "./pages/Finances/AddFinance";
import RecurringTransactions from "./pages/Finances/RecurringTransactions";
import ViewFinances from "./pages/Finances/ViewFinances";
import BusinessInsights from "./pages/BusinessInsights";
import Help from "./pages/Help";

// App Components
import Sidebar from "./assets/components/Sidebar";
import AdminRoute from "./assets/components/AdminRoute";

// Context Providers
import { AuthProvider } from "./data/AuthContext";
import { FinanceProvider } from "./data/FinanceContext";


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/members" element={<Members />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/enquiries" element={<Enquiries />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/finances/add" element={<AddFinance />} />
              <Route path="/finances/recurring" element={<RecurringTransactions />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<Help />} />

              {/* Admin-only Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/finances/view" element={
                  <FinanceProvider>
                    <ViewFinances />
                  </FinanceProvider>
                } />
                <Route path="/insights" element={<BusinessInsights />} />
              </Route>
            </Routes>
          </main>
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

