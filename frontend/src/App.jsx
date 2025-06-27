import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { AuthProvider, useAuth } from "./assets/AuthContext"; // Importing Auth Context
import Login from "./assets/Login";
import Home from "./assets/Home";
import Modules from "./assets/Modules";
import Topics from "./assets/Topics";
import TopicDetails from "./assets/TopicDetails";

const clientId = "452988976233-v5cck196uoeii6abjlmsi5mto4r6asf9.apps.googleusercontent.com";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
            <Route path="/topics/:level" element={<ProtectedRoute><Topics /></ProtectedRoute>} />
            <Route path="/levels/:levelId/topics/:topicId" element={<ProtectedRoute><TopicDetails /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
