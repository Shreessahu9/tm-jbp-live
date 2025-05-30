import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Header/Footer सिर्फ login और forgot-password पर hide करें
  const hideHeaderFooter = window.location.hash === '#/' || window.location.hash === '#/forgot-password';

  return (
    <HashRouter>
      {!hideHeaderFooter && <Header />}
      <div style={{ minHeight: "calc(100vh - 110px)" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/user-home" element={
            <ProtectedRoute><UserHome /></ProtectedRoute>
          } />
          <Route path="/admin-home" element={
            <ProtectedRoute><AdminHome /></ProtectedRoute>
          } />
          <Route path="/dashboard1" element={
            <ProtectedRoute><MachineAssignDashboard /></ProtectedRoute>
          } />
          <Route path="/broadcast" element={
            <ProtectedRoute><BroadcastMessage /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><UserProfile /></ProtectedRoute>
          } />
          <Route path="/competency" element={
            <ProtectedRoute><CompetencyMonitoring /></ProtectedRoute>
          } />
          <Route path="/super-competency" element={
            <ProtectedRoute><SuperCompetencyDashboard /></ProtectedRoute>
          } />
          <Route path="/superuser-profiles" element={
            <ProtectedRoute><SuperUserProfileDashboard /></ProtectedRoute>
          } />
          <Route path="/road-learning" element={
            <ProtectedRoute><RoadLearning /></ProtectedRoute>
          } />
          <Route path="/super-road-learning" element={
            <ProtectedRoute><SuperRoadLearningDashboard /></ProtectedRoute>
          } />
          <Route path="/machine-maintenance" element={
            <ProtectedRoute><MachineMaintenance /></ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute><About /></ProtectedRoute>
          } />
          <Route path="/super-schedule-dashboard" element={
            <ProtectedRoute><SuperScheduleDashboard /></ProtectedRoute>
          } />
          <Route path="/super-service-engineer" element={
            <ProtectedRoute><SuperServiceEngineerDashboard /></ProtectedRoute>
          } />
        </Routes>
      </div>
      {!hideHeaderFooter && <Footer />}
    </HashRouter>
  );
}

export default App;
