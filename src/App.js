import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/authentications/login';
import HomePage  from './pages/home';
import Signup from './pages/authentications/signup';
import FarmerDashboardLayout from './pages/farmer/dashboard';
import Recommendation from './pages/farmer/recommendation';


function App() {
  return (
      <Router>
          <div className="App">
              <Routes>

                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    
                    <Route path="/farmer-dashboard" element={<FarmerDashboardLayout />}>
                        <Route path="recommendation" element={<Recommendation />} />
                    </Route>
              </Routes>
              </div>
        </Router>
    );
}

export default App;