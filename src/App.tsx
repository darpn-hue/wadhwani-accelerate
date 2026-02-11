import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { DashboardLayout } from './layouts/DashboardLayout';
import { MyVentures } from './pages/MyVentures';
import { NewApplication } from './pages/NewApplication';
import { VentureDetails } from './pages/VentureDetails';
import { Monitor, RefreshCcw, Maximize2 } from 'lucide-react';
import { AuthProvider } from './context/AuthContext';

const Header = () => (
  <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 w-full z-50">
    <div className="font-bold text-red-700 text-lg">AccelerateMentor Workbench</div>
    <div className="flex items-center gap-4 text-gray-600">
      <div className="flex items-center gap-2">
        <Monitor className="w-5 h-5" />
        <span>Device</span>
      </div>
      <RefreshCcw className="w-5 h-5 cursor-pointer hover:text-gray-900" />
      <Maximize2 className="w-5 h-5 cursor-pointer hover:text-gray-900" />
    </div>
  </header>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <div className="min-h-screen bg-orange-50 pt-16 font-sans">
              <Header />
              <Welcome />
            </div>
          } />
          <Route path="/login" element={
            <div className="min-h-screen bg-orange-50 pt-16 font-sans">
              <Header />
              <Login />
            </div>
          } />
          <Route path="/signup" element={
            <div className="min-h-screen bg-orange-50 pt-16 font-sans">
              <Header />
              <Signup />
            </div>
          } />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<MyVentures />} />
            <Route path="new-application" element={<NewApplication />} />
            <Route path="venture/:id" element={<VentureDetails />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
