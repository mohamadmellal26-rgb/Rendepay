import React, { useState } from 'react';
import { Lock, UserCheck, Eye, EyeOff, ShieldCheck, ArrowRight, Building, KeyRound, AlertCircle } from 'lucide-react';
import './login.css';

interface UserSessionData {
  employeeId: string;
  email: string; 
  role: string; 
  branchCode: string;
  name: string;
  token?: string;
}

interface LoginProps {
  onLoginSuccess?: (data: UserSessionData) => void;
  onBackToHome?: () => void;
}

// رابط سيرفر الباك إند المرفوع على Ngrok
const API_BASE_URL = 'http://localhost:8080';

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // الفرع الرئيسي الموحد
  const branchName = '001 - الفرع الرئيسي';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!employeeId.trim() || !password || !otpToken.trim()) {
      setErrorMessage('جميع الحقول إجبارية لإتمام المصادقة المصرفية');
      return;
    }

    if (otpToken.length < 6) {
      setErrorMessage('رمز الأمان (OTP) يجب أن يتكون من 6 أرقام');
      return;
    }

    setIsLoading(true);

    try {
      // إرسال الطلب الفعلي لسيرفر Spring Boot
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // ترويسة مطلوبة لتجاوز صفحة الترحيب الخاصة بـ Ngrok
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          employeeCode: employeeId.trim(),
          password: password,
          otpToken: otpToken.trim()
        }),
      });

      if (!response.ok) {
        let errorMsg = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        try {
          const errorData = await response.json();
          if (errorData?.message) errorMsg = errorData.message;
        } catch (_) {
          // في حال إرجاع الاستجابة بتنسيق غير JSON
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();

      // تنسيق البيانات المستقبلة من السيرفر
      const userSession: UserSessionData = {
        employeeId: data.employeeCode || employeeId.toUpperCase(),
        email: data.email || `${employeeId.toLowerCase()}@rendepay-bank.com`,
        role: data.role || 'موظف شباك (Teller)',
        branchCode: data.branchCode || '001',
        name: data.name || `الموظف (${employeeId.toUpperCase()})`,
        token: data.token
      };

      // حفظ التوكن في LocalStorage لاستخدامه في الطلبات القادمة
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
      }

      if (onLoginSuccess) {
        onLoginSuccess(userSession);
      }

    } catch (error: any) {
      // التعامل المباشر مع أخطاء الشبكة و CORS و Ngrok
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setErrorMessage(
          'فشل الاتصال بالسيرفر (NetworkError). يرجى التأكد من تشغيل الباك إند أو فتح رابط Ngrok بالمتصفح أولاً وتجاوز حظر الأمن.'
        );
      } else {
        setErrorMessage(error.message || 'فشلت عملية المصادقة. يرجى التأكد من البيانات أو الاتصال بالسيرفر');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rendepay-login-page">
      <div className="login-card">
        
        {/* العودة للرئيسية */}
        {onBackToHome && (
          <button type="button" className="btn-back-link" onClick={onBackToHome}>
            <ArrowRight size={16} />
            <span>العودة للرئيسية</span>
          </button>
        )}

        {/* ترويسة النموذج المصرفي */}
        <div className="login-header">
          <div className="system-badge">
            <ShieldCheck size={20} />
            <span>بوابة المصادقة المصرفية | Rendepay</span>
          </div>
          <h1 className="login-title">تسجيل دخول موظف بنكي</h1>
          <p className="login-subtitle">
            أدخل معرّف الموظف وكلمة المرور ورمز Token المصرفي لإثبات الهوية.
          </p>
        </div>

        {/* تنبيه الخطأ */}
        {errorMessage && (
          <div className="login-error-alert">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* نموذج تسجيل الدخول */}
        <form onSubmit={handleSubmit} className="login-form">
          
          {/* رقم الموظف المعرف */}
          <div className="login-form-group">
            <label htmlFor="employeeId">معرّف الموظف (Employee ID)</label>
            <div className="input-icon-wrapper">
              <UserCheck className="input-icon" size={18} />
              <input
                id="employeeId"
                type="text"
                placeholder="مثال: EMP-8802 أو ADM-101"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="login-input"
                required
                autoComplete="off"
              />
            </div>
          </div>

          {/* كلمة المرور */}
          <div className="login-form-group">
            <label htmlFor="password">كلمة المرور المصرفية</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* الفرع مثبت ومعروض للعلم فقط */}
          <div className="login-form-group">
            <label>الفرع المحدد للجلسة</label>
            <div className="input-icon-wrapper">
              <Building className="input-icon" size={18} />
              <input
                type="text"
                value={branchName}
                readOnly
                className="login-input readonly-input"
              />
            </div>
          </div>

          {/* رمز الأمان المصرفي OTP */}
          <div className="login-form-group">
            <label htmlFor="otpToken">رمز الأمان المؤقت (Hardware Token / OTP)</label>
            <div className="input-icon-wrapper">
              <KeyRound className="input-icon" size={18} />
              <input
                id="otpToken"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                className="login-input token-input"
                required
              />
            </div>
          </div>

          {/* زر التقديم */}
          <button type="submit" className="btn-submit-login" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner">جاري الاتصال بالسيرفر والتحقق...</span>
            ) : (
              <span>مصادقة الجلسة وبدء العمل</span>
            )}
          </button>
        </form>

        {/* التذييل */}
        <div className="login-footer">
          <span>يتم تحديد الصلاحيات والمهام آلياً عبر خادم الأمان البنكي Central Auth.</span>
          <span className="security-notice">تشفير عالي الأمان (256-bit HSM Encrypted)</span>
        </div>

      </div>
    </div>
  );
};

export default Login;