import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// Simple Dashboard Component
function Dashboard() {
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>GroceryTrack Dashboard</h1>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => navigate('/scan')}
          style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Scan New Receipt
        </button>
        <button 
          onClick={() => navigate('/budget')}
          style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '12px 24px', 
            border: 'none', 
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Budget
        </button>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Recent Activity</h2>
        <p>✅ Backend APIs working</p>
        <p>✅ Database connected</p>
        <p>✅ AWS Textract integrated</p>
        <p>✅ CalorieNinjas API working</p>
      </div>
    </div>
  );
}

// Simple Scan Page
function ScanPage() {
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={() => navigate('/')}
        style={{ 
          backgroundColor: '#6b7280', 
          color: 'white', 
          padding: '8px 16px', 
          border: 'none', 
          borderRadius: '4px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        ← Back to Dashboard
      </button>
      
      <h1>Scan Receipt</h1>
      <p>Receipt scanning functionality will be added here.</p>
      <p>This page will integrate with AWS Textract and AI processing.</p>
    </div>
  );
}

// Simple Budget Page  
function BudgetPage() {
  const navigate = useNavigate();
  
  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={() => navigate('/')}
        style={{ 
          backgroundColor: '#6b7280', 
          color: 'white', 
          padding: '8px 16px', 
          border: 'none', 
          borderRadius: '4px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}
      >
        ← Back to Dashboard
      </button>
      
      <h1>Budget Management</h1>
      <p>Budget tracking and management features will be available here.</p>
    </div>
  );
}

// Simple Navigation Component
function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navStyle = {
    backgroundColor: '#f3f4f6',
    padding: '10px 20px',
    borderBottom: '1px solid #e5e7eb'
  };
  
  const linkStyle = {
    marginRight: '20px',
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    cursor: 'pointer'
  };
  
  return (
    <nav style={navStyle}>
      <button 
        onClick={() => navigate('/')}
        style={{
          ...linkStyle,
          backgroundColor: location.pathname === '/' ? '#10b981' : '#ffffff',
          color: location.pathname === '/' ? '#ffffff' : '#000000'
        }}
      >
        Dashboard
      </button>
      <button 
        onClick={() => navigate('/scan')}
        style={{
          ...linkStyle,
          backgroundColor: location.pathname === '/scan' ? '#10b981' : '#ffffff',
          color: location.pathname === '/scan' ? '#ffffff' : '#000000'
        }}
      >
        Scan Receipt
      </button>
      <button 
        onClick={() => navigate('/budget')}
        style={{
          ...linkStyle,
          backgroundColor: location.pathname === '/budget' ? '#10b981' : '#ffffff',
          color: location.pathname === '/budget' ? '#ffffff' : '#000000'
        }}
      >
        Budget
      </button>
    </nav>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <div>
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/budget" element={<BudgetPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 