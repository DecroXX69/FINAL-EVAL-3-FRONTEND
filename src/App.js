import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Workspace from './components/Workspace'; // Import Workspace
import Settings from './components/Settings';
import FormEditor from './components/FormEditor';
import './App.css';
import FormShare from './components/FormShare';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/workspace" element={<Workspace />} /> {/* Add Workspace route */}
        <Route path="/workspace/share/:workspaceId" element={<Workspace />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/form-editor/:formbotId" element={<FormEditor />} />
        <Route path="/f/:shareToken" element={<FormShare />} />
      </Routes>
    </Router>
  );
}

export default App;