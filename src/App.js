import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/authentications/login';
import HomePage  from './pages/home';
import Signup from './pages/authentications/signup';


function App() {
  return (
      <Router>
          <div className="App">
              <Routes>

                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
              </Routes>
              </div>
        </Router>
    );
}

export default App;