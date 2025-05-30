import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import UserHome from './components/UserHome';
import AdminHome from './components/AdminHome';
import MachineAssignDashboard from './components/MachineAssignDashboard';
import BroadcastMessage from './components/BroadcastMessage';
import UserProfile from './components/UserProfile';
import CompetencyMonitoring from './components/CompetencyMonitoring';
import SuperCompetencyDashboard from './components/SuperCompetencyDashboard';
import SuperUserProfileDashboard from './components/SuperUserProfileDashboard';
import RoadLearning from './components/RoadLearning';
import SuperRoadLearningDashboard from './components/SuperRoadLearningDashboard';
import MachineMaintenance from './components/MachineMaintenance';
import SuperScheduleDashboard from './components/SuperScheduleDashboard';
import SuperServiceEngineerDashboard from './components/SuperServiceEngineerDashboard';
import About from "./components/About";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div style={{ minHeight: "calc(100vh - 110px)" }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/user-home" element={<UserHome />} />
          <Route path="/admin-home" element={<AdminHome />} />
          <Route path="/dashboard1" element={<MachineAssignDashboard />} />
          <Route path="/broadcast" element={<BroadcastMessage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/competency" element={<CompetencyMonitoring />} />
          <Route path="/super-competency" element={<SuperCompetencyDashboard />} />
          <Route path="/superuser-profiles" element={<SuperUserProfileDashboard />} />
          <Route path="/road-learning" element={<RoadLearning />} />
          <Route path="/super-road-learning" element={<SuperRoadLearningDashboard />} />
          <Route path="/machine-maintenance" element={<MachineMaintenance />} />
		   <Route path="/about" element={<About />} />
          <Route path="/super-schedule-dashboard" element={<SuperScheduleDashboard />} />
          <Route path="/super-service-engineer" element={<SuperServiceEngineerDashboard />} />
        </Routes>
      </div>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
