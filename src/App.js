import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/authentications/login';
import HomePage  from './pages/home';
import Signup from './pages/authentications/signup';
import FarmerDashboardLayout from './pages/farmer/dashboard';
import Recommendation from './pages/farmer/recommendation';
import SupplierDashboardLayout from './pages/supplier/supplier_dashboard';
import Profile from './pages/supplier/supplier_profile';
import Products from './pages/supplier/supplier_product';
import AdminDashboardLayouts from './pages/Admin/admin_dashboard';
import AdminHome from './pages/Admin/overview';
import FarmOverview from './pages/farmer/farmer-overview';
import SupplierOverview from './pages/supplier/supp-overview';
import UserManagement from './pages/Admin/user_management';

function App() {
  return (
      <Router>
          <div className="App">
              <Routes>

                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                      {/* farmer routes */}
                    <Route path="/farmer-dashboard" element={<FarmerDashboardLayout />}>
                        <Route index element={<FarmOverview />} />
                        <Route path="recommendation" element={<Recommendation />} />
                    </Route>

                {/* suplier routes */}

                <Route path="/supplier-dashboard" element={<SupplierDashboardLayout />}>
                    <Route index element={<SupplierOverview />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="products" element={<Products/>}/>
                </Route>

                {/* admin routes */}

                <Route path="/admin-dashboard" element={<AdminDashboardLayouts />}>
                <Route index element={<AdminHome />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="products" element={<Products/>}/>
                </Route>
              </Routes>
              </div>
        </Router>
    );
}

export default App;