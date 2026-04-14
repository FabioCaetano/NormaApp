import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@contexts/AuthContext';
import Header from '@components/Header';
import Footer from '@components/Footer';
import ProtectedRoute from '@components/ProtectedRoute';
import Home from '@pages/Home';
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import Booking from '@pages/Booking';
import Dashboard from '@pages/Dashboard';
import Admin from '@pages/admin/Admin';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-dark-900 text-white flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/booking" element={<Booking />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1A1A1A',
                color: '#FFFFFF',
                border: '1px solid #2D6A4F',
              },
              success: {
                iconTheme: {
                  primary: '#C9A84C',
                  secondary: '#1A1A1A',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#1A1A1A',
                },
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}
