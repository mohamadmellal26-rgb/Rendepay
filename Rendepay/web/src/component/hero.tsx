import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Users, 
  Activity, 
  Search, 
  PlusCircle, 
  FileText,
  Plus,
  Minus,
  Ban,
  Trash2,
  DollarSign,
  UserCheck,
  Lock,
  LogIn,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './hero.css';

const API_BASE_URL = 'https://afford-unbridle-apprehend.ngrok-free.dev';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon }) => (
  <div className="hero-stat-card">
    <div className="stat-header">
      <span className="stat-title">{title}</span>
      <div className="stat-icon-wrapper">{icon}</div>
    </div>
    <div className="stat-body">
      <span className="stat-value">{value}</span>
      {change && (
        <span className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
          {change}
        </span>
      )}
    </div>
  </div>
);

interface HeroProps {
  isLoggedIn?: boolean;
  employeeName?: string;
  employeeRole?: string;
  loginPath?: string;
  totalTransactionsToday?: string;
  activeAccountsCount?: string;
  pendingApprovalsCount?: string;
  onNewTransaction?: () => void;
  onOpenCustomerLookup?: () => void;
  onGenerateReport?: () => void;
}

interface CardItem {
  id: string | number;
  cardCode?: string;
  cardNumber?: string;
  ownerName?: string;
  cardName?: string;
  balance: number;
  isBanned?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  isLoggedIn = false,
  employeeName,
  employeeRole,
  loginPath = "/login",
  totalTransactionsToday = "0",
  activeAccountsCount = "0",
  pendingApprovalsCount = "0",
  onNewTransaction,
  onOpenCustomerLookup,
  onGenerateReport
}) => {
  const [cardNumberInput, setCardNumberInput] = useState('');
  const [cardNameInput, setCardNameInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [totalDeposited, setTotalDeposited] = useState(0);

  // جلب البطاقات من السيرفر عند تسجيل الدخول
  useEffect(() => {
    if (isLoggedIn) {
      fetchCards();
    }
  }, [isLoggedIn]);

  const fetchCards = async () => {
    setLoadingCards(true);
    setErrorMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/cards`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        }
      });
      if (!response.ok) throw new Error('فشل جلب بيانات البطاقات من السيرفر');
      const data = await response.json();
      setCards(data);
    } catch (error: any) {
      setErrorMessage(error.message || 'خطأ في الاتصال بالباك إند');
    } finally {
      setLoadingCards(false);
    }
  };

  // إضافة بطاقة جديدة للسيرفر
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumberInput || !cardNameInput) return;
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          cardCode: cardNumberInput,
          ownerName: cardNameInput,
          balance: 0
        })
      });

      if (!response.ok) throw new Error('فشلت عملية إنشاء البطاقة');
      
      const newCard = await response.json();
      setCards((prev) => [...prev, newCard]);
      setCardNumberInput('');
      setCardNameInput('');
    } catch (error: any) {
      setErrorMessage(error.message || 'حدث خطأ عند إضافة البطاقة');
    }
  };

  // إيداع / شحن أموال
  const handleDeposit = async (id: string | number) => {
    const numAmount = parseFloat(amountInput);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('يرجى أدخل مبلغ صحيح أكبر من 0');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/cards/${id}/top-up`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ amount: numAmount })
      });

      if (!response.ok) throw new Error('فشلت عملية الإيداع');

      const updatedCard = await response.json();
      setCards(cards.map(c => (c.id === id ? updatedCard : c)));
      setTotalDeposited(prev => prev + numAmount);
      setAmountInput('');
    } catch (error: any) {
      alert(error.message || 'خطأ أثناء الإيداع');
    }
  };

  // سحب أموال
  const handleWithdraw = async (id: string | number) => {
    const numAmount = parseFloat(amountInput);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('يرجى أدخل مبلغ صحيح أكبر من 0');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/cards/${id}/withdraw`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ amount: numAmount })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || 'الرصيد غير كافٍ أو حدث خطأ أثناء السحب');
      }

      const updatedCard = await response.json();
      setCards(cards.map(c => (c.id === id ? updatedCard : c)));
      setTotalWithdrawn(prev => prev + numAmount);
      setAmountInput('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  // تبنيد / إلغاء تبنيد البطاقة محلياً
  const handleToggleBan = (id: string | number) => {
    setCards(cards.map(card => {
      if (card.id === id) {
        return { ...card, isBanned: !card.isBanned };
      }
      return card;
    }));
  };

  // حذف البطاقة
  const handleDeleteCard = (id: string | number) => {
    setCards(cards.filter(card => card.id !== id));
  };

  return (
    <section className="rendepay-hero">
      <div className="hero-container">
        
        {/* قسم الترحيب الرئيسي */}
        <div className="hero-welcome-block">
          <div className="welcome-text-group">
            <span className="system-tag">نظام العمليات المصرفية | Rendepay</span>
            <h1 className="hero-title">
              {isLoggedIn && employeeName 
                ? `مرحباً بك، ${employeeName}` 
                : "منظومة Rendepay لإدارة الحسابات والعمليات"}
            </h1>
            <p className="hero-subtitle">
              {isLoggedIn && employeeRole 
                ? `صلاحيات الجلسة: ${employeeRole} — قم بإدارة التحويلات والعمليات اليومية لموظفي البنك بسرعة وأمان.`
                : "يرجى تسجيل الدخول للوصول إلى وحدة التحكم وإدارة طلبات العملاء والتحويلات."}
            </p>
          </div>

          {isLoggedIn && (
            <div className="hero-actions-group">
              <button className="btn-primary" onClick={onNewTransaction}>
                <PlusCircle size={16} />
                <span>عملية جديدة</span>
              </button>
              <button className="btn-secondary" onClick={onOpenCustomerLookup}>
                <Search size={16} />
                <span>استعلام عن عميل</span>
              </button>
              <button className="btn-outline" onClick={onGenerateReport}>
                <FileText size={16} />
                <span>تقرير اليوم</span>
              </button>
            </div>
          )}
        </div>

        {!isLoggedIn ? (
          <div className="login-required-card">
            <div className="login-required-icon">
              <Lock size={48} color="#333333" />
            </div>
            <h2>سجّل دخولك للوصول إلى اللوحة</h2>
            <p>هذه المنطقة مخصصة لموظفي البنك المصرح لهم فقط. يرجى تسجيل الدخول لمتابعة إدارة البطاقات والعمليات المالية.</p>
            <Link to={loginPath} className="btn-login-now">
              <LogIn size={18} />
              <span>تسجيل الدخول الآن</span>
            </Link>
          </div>
        ) : (
          <>
            {/* رسائل الخطأ */}
            {errorMessage && (
              <div className="login-error-alert" style={{ marginBottom: '20px' }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* كروت الإحصائيات المباشرة */}
            <div className="hero-stats-grid">
              <StatCard 
                title="إجمالي معاملات اليوم" 
                value={totalTransactionsToday} 
                change="+12.5%" 
                isPositive={true}
                icon={<Activity size={18} />} 
              />
              <StatCard 
                title="الحسابات النشطة" 
                value={activeAccountsCount} 
                change="+3" 
                isPositive={true}
                icon={<Users size={18} />} 
              />
              <StatCard 
                title="طلبات بانتظار الموافقة" 
                value={pendingApprovalsCount} 
                change="-2" 
                isPositive={false}
                icon={<CreditCard size={18} />} 
              />
              <StatCard 
                title="إجمالي المسحوبات الكلي" 
                value={`$${totalWithdrawn.toLocaleString()}`} 
                isPositive={false}
                icon={<DollarSign size={18} />} 
              />
              <StatCard 
                title="إجمالي الإيداعات الكلي" 
                value={`$${totalDeposited.toLocaleString()}`} 
                isPositive={true}
                icon={<DollarSign size={18} />} 
              />
            </div>

            {/* لوحة التحكم بالبطاقات والعمليات المباشرة */}
            <div className="card-management-section">
              <h2 className="section-title">إدارة البطاقات والعمليات المباشرة</h2>
              
              {/* نموذج إضافة بطاقة وإدخال المبالغ */}
              <form onSubmit={handleAddCard} className="card-form">
                <div className="form-group">
                  <label>رقم البطاقة (Card Code)</label>
                  <input 
                    type="text" 
                    placeholder="0000 0000 0000 0000" 
                    value={cardNumberInput}
                    onChange={(e) => setCardNumberInput(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>اسم صاحب البطاقة</label>
                  <input 
                    type="text" 
                    placeholder="الاسم الكامل" 
                    value={cardNameInput}
                    onChange={(e) => setCardNameInput(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>المبلغ للعمليات (سحب / إيداع)</label>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="form-input"
                    min="0"
                    step="any"
                  />
                </div>

                <button type="submit" className="btn-add-card">
                  <Plus size={16} />
                  <span>إضافة بطاقة جديدة</span>
                </button>
              </form>

              {/* عرض حالة التحميل أو بطاقات البنك */}
              {loadingCards ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <Loader2 className="spinner" size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '10px' }}>جاري جلب البطاقات من السيرفر...</p>
                </div>
              ) : (
                <div className="cards-display-grid">
                  {cards.length === 0 ? (
                    <div className="no-cards-msg">لا يوجد كروت مضافة حتى الآن.</div>
                  ) : (
                    cards.map((card) => {
                      const cName = card.ownerName || card.cardName || 'بدون اسم';
                      const cCode = card.cardCode || card.cardNumber || 'N/A';
                      const isBanned = !!card.isBanned;

                      return (
                        <div key={card.id} className={`bank-card-item ${isBanned ? 'banned' : ''}`}>
                          <div className="card-top">
                            <div className="card-brand-info">
                              <CreditCard size={20} />
                              <span className="card-owner">{cName}</span>
                            </div>
                            <span className={`status-pill ${isBanned ? 'banned' : 'active'}`}>
                              {isBanned ? 'مبندة' : 'نشطة'}
                            </span>
                          </div>

                          <div className="card-number-display">{cCode}</div>

                          <div className="card-balance-display">
                            <span className="balance-label">الرصيد:</span>
                            <span className="balance-value">${card.balance ? card.balance.toLocaleString() : '0'}</span>
                          </div>

                          <div className="card-actions-bar">
                            <button 
                              type="button"
                              className="btn-card-action deposit" 
                              onClick={() => handleDeposit(card.id)}
                              disabled={isBanned}
                              title="إضافة أموال"
                            >
                              <Plus size={14} />
                              <span>إيداع</span>
                            </button>

                            <button 
                              type="button"
                              className="btn-card-action withdraw" 
                              onClick={() => handleWithdraw(card.id)}
                              disabled={isBanned}
                              title="سحب أموال"
                            >
                              <Minus size={14} />
                              <span>سحب</span>
                            </button>

                            <button 
                              type="button"
                              className={`btn-card-action ban ${isBanned ? 'unban' : ''}`} 
                              onClick={() => handleToggleBan(card.id)}
                              title={isBanned ? "فك التبنيد" : "تبنيد البطاقة"}
                            >
                              {isBanned ? <UserCheck size={14} /> : <Ban size={14} />}
                              <span>{isBanned ? 'فك التبنيد' : 'تبنيد'}</span>
                            </button>

                            <button 
                              type="button"
                              className="btn-card-action delete" 
                              onClick={() => handleDeleteCard(card.id)}
                              title="حذف البطاقة"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </section>
  );
};

export default Hero;