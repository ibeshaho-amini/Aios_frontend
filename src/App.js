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
import Market from './pages/farmer/marketplace';
import SuppOrders from './pages/supplier/supp_order';
import FarmerOrder from './pages/farmer/farmer-order';
import AgronomistDashboardLayout from './pages/agronomist/dashboard';
import AgronomistInbox from './pages/agronomist/inboxes';
import MyReviews from './pages/agronomist/myReviews'
import FarmerRecommendations from './pages/farmer/farmer-reviews'
import FarmerProfile from './pages/farmer/farmer_profile'
import AgroOverview from './pages/agronomist/overview'
import SupAnalytics from './pages/supplier/analytics'
import AgroAnalytic from './pages/agronomist/analytics'
import AdminAnalytics from './pages/Admin/analytic'
import LeaderDashboard from './pages/leader/dashboard'
import Usage from './pages/farmer/farmer _usage'
function App() {
  return (
      <Router>
          <div className="App">
              <Routes>

                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path ="/market" element={<Market/>}/>

                      {/* farmer routes */}
                    <Route path="/farmer-dashboard" element={<FarmerDashboardLayout />}>
                        
                        <Route index element={<FarmOverview />} />
                        <Route path="overview" element={<FarmOverview />} />
                        <Route path="recommendation" element={<Recommendation />} />
                        <Route path="farmerOrder" element={<FarmerOrder/>}/>
                        <Route path="farmerRecommendations" element={<FarmerRecommendations/>}/>
                        <Route path="farmerProfile" element={<FarmerProfile/>}/>
                        <Route path="usage" element={<Usage/>}/>
                    </Route>

                {/* suplier routes */}

                <Route path="/supplier-dashboard" element={<SupplierDashboardLayout />}>
                    <Route index element={<SupplierOverview />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="products" element={<Products/>}/>
                    <Route path="suppOrders" element={<SuppOrders/>}/>
                    <Route path="supAnalytics" element={<SupAnalytics/>}/>
                </Route>

                {/* admin routes */}

                <Route path="/admin-dashboard" element={<AdminDashboardLayouts />}>
                <Route index element={<AdminHome />}/>
                    <Route path="users" element={<UserManagement />} />
                    <Route path="products" element={<Products/>}/>
                    <Route path="adminAnalytics" element={<AdminAnalytics/>}/>s
                    
                </Route>

                <Route path="/agronomist-dashboard" element={<AgronomistDashboardLayout />}>
                    <Route index element={<AgroOverview />}/>
                    <Route path="agroOverview" element={<AgroOverview/>}/>
                    <Route path="agronomistInbox" element={<AgronomistInbox />}/>
                    <Route path="myReviews" element={<MyReviews/>}/>
                    <Route path="agroAnalytic" element={<AgroAnalytic/>}/>
                
                </Route>

                  <Route path="/leader-dashboard" element={<LeaderDashboard />}>

                    <Route index element={<AgroOverview />}/>
                  
                  </Route>

              </Routes>
              </div>
        </Router>
    );
}

export default App;