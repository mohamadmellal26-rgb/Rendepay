import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import Header from './component/header';
import Hero from './component/hero';
import Login from './component/login';

interface EmployeeData {
  name: string;
  role: string;
  id?: string;
}

// المكون الرئيسي للتطبيق
function AppContent() {
  const navigate = useNavigate();
  
  // قراءة الحالة الابتدائية من LocalStorage (الافتراضي false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [employee, setEmployee] = useState<EmployeeData | null>(() => {
    const saved = localStorage.getItem('employeeData');
    return saved ? JSON.parse(saved) : null;
  });

  // تسجيل الدخول الناجح
  const handleLoginSuccess = (data: { email: string; role: string }) => {
    const newEmployee = {
      name: data.email.split('@')[0], // اسم مؤقت من البريد
      role: data.role || "مطور نظم",
      id: "EMP-102"
    };

    setIsLoggedIn(true);
    setEmployee(newEmployee);

    // حفظ الجلسة
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('employeeData', JSON.stringify(newEmployee));

    navigate('/');
  };

  // تسجيل الخروج
  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmployee(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('employeeData');
  };

  return (
    <Routes>
      {/* الصفحة الرئيسية */}
      <Route 
        path="/" 
        element={
          <>
            <Header 
              isLoggedIn={isLoggedIn} 
              employee={employee}
              onLogout={handleLogout}
            />
            <Hero 
              isLoggedIn={isLoggedIn} 
              employeeName={employee?.name} 
              employeeRole={employee?.role} 
            />
          </>
        } 
      />
      
      {/* صفحة تسجيل الدخول */}
      <Route 
        path="/login" 
        element={
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            onBackToHome={() => navigate('/')} 
          />
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}