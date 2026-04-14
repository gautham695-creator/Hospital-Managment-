import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    if (user.role === 'admin') {
      window.location.href = '/admin/dashboard';
      return null;
    } else if (user.role === 'doctor') {
      window.location.href = '/doctor/dashboard';
      return null;
    } else {
      window.location.href = '/patient/dashboard';
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            🏥 Hospital Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamline your hospital operations with our comprehensive management solution
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 font-medium"
            >
              Register
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-xl font-semibold mb-2">For Patients</h3>
            <p className="text-gray-600">
              Book appointments, view prescriptions, and manage your medical records easily.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-semibold mb-2">For Doctors</h3>
            <p className="text-gray-600">
              Manage appointments, create prescriptions, and set your availability schedule.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-2">For Administrators</h3>
            <p className="text-gray-600">
              Oversee all operations, manage users, and view comprehensive reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
