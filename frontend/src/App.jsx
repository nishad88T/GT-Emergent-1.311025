import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// Import our API client
import emergentAPI from './api/emergentClient';

// Simple Dashboard Component with proper styling
function Dashboard() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load recent receipts
      const receiptData = await emergentAPI.Receipt.find({}, '-created_date', 10);
      setReceipts(receiptData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GroceryTrack</h1>
          <p className="text-xl text-gray-600">Welcome back! 👋</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => navigate('/scan')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-lg transition-colors duration-200 text-left"
          >
            <div className="text-2xl mb-2">📱</div>
            <h3 className="text-xl font-semibold mb-2">Scan New Receipt</h3>
            <p className="text-green-100">AI-powered receipt scanning</p>
          </button>

          <button
            onClick={() => navigate('/budget')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-lg transition-colors duration-200 text-left"
          >
            <div className="text-2xl mb-2">💰</div>
            <h3 className="text-xl font-semibold mb-2">Budget & Stats</h3>
            <p className="text-blue-100">Track spending & budgets</p>
          </button>

          <button
            onClick={() => navigate('/analytics')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg shadow-lg transition-colors duration-200 text-left"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-purple-100">Insights & trends</p>
          </button>
        </div>

        {/* Recent Receipts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Receipts</h2>
          {loading ? (
            <p className="text-gray-500">Loading receipts...</p>
          ) : receipts.length > 0 ? (
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{receipt.supermarket}</h3>
                      <p className="text-gray-600">{receipt.purchase_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{receipt.currency} {receipt.total_amount?.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        receipt.validation_status === 'review_insights' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {receipt.validation_status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No receipts yet</p>
              <button
                onClick={() => navigate('/scan')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Scan Your First Receipt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple Scan Page with real functionality
function ScanPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.length || !storeName || !totalAmount) {
      alert('Please fill in all fields and select an image');
      return;
    }

    setLoading(true);
    try {
      // Upload files
      const uploadResults = [];
      for (const file of files) {
        const result = await emergentAPI.integrations.Core.UploadFile({ file });
        uploadResults.push(result);
      }
      
      const file_urls = uploadResults.map(result => result.file_url);

      // Create receipt
      const receipt = await emergentAPI.Receipt.create({
        supermarket: storeName,
        purchase_date: new Date().toISOString().split('T')[0],
        total_amount: parseFloat(totalAmount),
        receipt_image_urls: file_urls,
        currency: 'GBP',
        validation_status: 'processing_background',
        household_id: 'c756604e-d3e8-4e6e-918e-12d7d96c877d', // Use test household
        user_email: 'test@grocerytrack.app',
        notes: 'Created via web interface'
      });

      alert('Receipt submitted successfully! AI processing has started.');
      navigate('/');
    } catch (error) {
      console.error('Error submitting receipt:', error);
      alert('Error submitting receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          ← Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Scan Receipt</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. Tesco, Sainsbury's, ASDA"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount (£) *
              </label>
              <input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="e.g. 25.99"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Image *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Scan Receipt with AI'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">How it works:</h3>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Upload your receipt photo</li>
              <li>• AWS Textract extracts the text</li>
              <li>• OpenAI GPT-4 analyzes and categorizes items</li>
              <li>• Get detailed insights and nutrition data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Budget Page  
function BudgetPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          ← Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Budget Management</h1>
          <p className="text-gray-600 mb-4">Budget tracking and management features coming soon.</p>
          <p className="text-gray-600">This will include:</p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>• Monthly and weekly budget setting</li>
            <li>• Category-wise spending limits</li>
            <li>• Real-time spending alerts</li>
            <li>• Budget performance analytics</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Simple Analytics Page
function AnalyticsPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          ← Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Analytics & Insights</h1>
          <p className="text-gray-600 mb-4">Advanced analytics and insights coming soon.</p>
          <p className="text-gray-600">This will include:</p>
          <ul className="mt-4 space-y-2 text-gray-600">
            <li>• Spending trends and patterns</li>
            <li>• Category breakdown charts</li>
            <li>• Price comparison insights</li>
            <li>• Nutrition analysis</li>
            <li>• Money-saving recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Navigation Component with improved styling
function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/scan', label: 'Scan Receipt', icon: '📱' },
    { path: '/budget', label: 'Budget', icon: '💰' },
    { path: '/analytics', label: 'Analytics', icon: '📊' }
  ];
  
  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                location.pathname === item.path
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 