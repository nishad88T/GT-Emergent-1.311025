import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// Import our API client
import emergentAPI from './api/emergentClient';

// Import all page components
import Dashboard from './pages/Dashboard';
import ScanReceipt from './pages/ScanReceipt';
import Receipts from './pages/Receipts';
import Budget from './pages/Budget';
import Nutrition from './pages/Nutrition';
import Analytics from './pages/Analytics';
import Recipes from './pages/Recipes';
import MealPlan from './pages/MealPlan';
import ShoppingList from './pages/ShoppingList';
import Household from './pages/Household';
import Settings from './pages/Settings';
import OperationalInsights from './pages/OperationalInsights';
import OCRTestingDashboard from './pages/OCRTestingDashboard';

// Simple Working Dashboard
function Dashboard() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">GroceryTrack</h1>
          <p className="text-xl text-gray-600">Welcome back! 👋</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/scan')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-lg transition-colors duration-200 text-left"
          >
            <div className="text-2xl mb-2">📱</div>
            <h3 className="text-xl font-semibold mb-2">Scan Receipt</h3>
            <p className="text-green-100">GPT-4 mini powered</p>
          </button>

          <button
            onClick={() => navigate('/receipts')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-lg transition-colors duration-200 text-left"
          >
            <div className="text-2xl mb-2">📄</div>
            <h3 className="text-xl font-semibold mb-2">View Receipts</h3>
            <p className="text-blue-100">Review & validate</p>
          </button>

          <button
            onClick={() => navigate('/budget')}
            className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg shadow-lg transition-colors duration-200 text-left"
          >
            <div className="text-2xl mb-2">💰</div>
            <h3 className="text-xl font-semibold mb-2">Budget</h3>
            <p className="text-purple-100">Track spending</p>
          </button>

          <button
            onClick={() => navigate('/nutrition')}
            className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg shadow-lg transition-colors duration-200 text-left"
          >
            <div className="text-2xl mb-2">🥗</div>
            <h3 className="text-xl font-semibold mb-2">Nutrition</h3>
            <p className="text-orange-100">Health insights</p>
          </button>
        </div>

        {/* Recent Receipts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Receipts</h2>
          {loading ? (
            <p className="text-gray-500">Loading receipts...</p>
          ) : receipts.length > 0 ? (
            <div className="space-y-3">
              {receipts.slice(0, 5).map((receipt) => (
                <div key={receipt.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{receipt.supermarket}</h3>
                      <p className="text-gray-600 text-sm">{receipt.purchase_date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{receipt.currency} {receipt.total_amount?.toFixed(2)}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        receipt.validation_status === 'review_insights' 
                          ? 'bg-blue-100 text-blue-800' 
                          : receipt.validation_status === 'approved'
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

// Scan Page with GPT-4 mini
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
        household_id: 'c756604e-d3e8-4e6e-918e-12d7d96c877d',
        user_email: 'test@grocerytrack.app',
        notes: 'Scanned with GPT-4 mini'
      });

      alert('Receipt submitted! GPT-4 mini is processing...');
      navigate('/receipts');
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
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6">Scan Receipt</h1>
          <p className="text-gray-600 mb-6">Powered by GPT-4 mini for cost-effective AI analysis</p>
          
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
              {loading ? 'Processing with GPT-4 mini...' : 'Scan Receipt'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">Cost-Effective AI Pipeline:</h3>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• AWS Textract: Extract text from receipt</li>
              <li>• GPT-4 mini: Analyze & categorize items (cost-effective)</li>
              <li>• CalorieNinjas: Add nutrition data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Receipts Page
function ReceiptsPage() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const receiptData = await emergentAPI.Receipt.find({}, '-created_date', 50);
      setReceipts(receiptData || []);
    } catch (error) {
      console.error('Error loading receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Receipts</h1>
          <button
            onClick={() => navigate('/scan')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            + Scan New Receipt
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading receipts...</p>
        ) : receipts.length > 0 ? (
          <div className="grid gap-4">
            {receipts.map((receipt) => (
              <div key={receipt.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{receipt.supermarket}</h3>
                    <p className="text-gray-500 text-sm">📅 {receipt.purchase_date}</p>
                    {receipt.notes && (
                      <p className="text-gray-600 text-sm mt-1">📝 {receipt.notes}</p>
                    )}
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${
                        receipt.validation_status === 'processing_background' ? 'bg-yellow-100 text-yellow-800' :
                        receipt.validation_status === 'review_insights' ? 'bg-blue-100 text-blue-800' :
                        receipt.validation_status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {receipt.validation_status?.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Show Items if available */}
                    {receipt.items && receipt.items.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Items ({receipt.items.length})</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {receipt.items.map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded p-2 text-sm">
                              <div className="flex justify-between">
                                <span className="font-medium">{item.canonical_name || item.name}</span>
                                <span>{receipt.currency} {(item.total_price || item.unit_price || 0).toFixed(2)}</span>
                              </div>
                              {item.category && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {item.category}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show AI Insights if available */}
                    {receipt.receipt_insights && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900 text-sm">🤖 GPT-4 mini Insights</h4>
                        <p className="text-blue-800 text-sm mt-1">{receipt.receipt_insights.summary}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-green-600">
                      {receipt.currency} {receipt.total_amount?.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {receipt.items?.length || 0} items
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No receipts found</p>
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
  );
}

// Simple Budget Page
function BudgetPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Budget Management</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Budget Features Coming Soon</h2>
          <p className="text-gray-600">Full budget management system in development.</p>
        </div>
      </div>
    </div>
  );
}

// Simple Nutrition Page  
function NutritionPage() {
  const [testResult, setTestResult] = useState(null);

  const testNutritionAPI = async () => {
    try {
      const result = await emergentAPI.calorieNinjasNutrition({
        canonical_name: 'apple',
        household_id: 'test'
      });
      setTestResult(result);
    } catch (error) {
      console.error('Error testing nutrition API:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Nutrition Analysis</h1>
          <button
            onClick={testNutritionAPI}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Test CalorieNinjas API
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Nutrition Features</h2>
          <p className="text-gray-600 mb-4">Automatic nutrition analysis for scanned items.</p>
          
          {testResult && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900">API Test Result:</h3>
              <p className="text-green-800">
                Apple: {testResult.calories} calories, {testResult.protein_g}g protein, 
                {testResult.carbohydrate_g}g carbs, {testResult.fat_g}g fat
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Navigation Component with all features
function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/scan', label: 'Scan', icon: '📱' },
    { path: '/receipts', label: 'Receipts', icon: '📄' },
    { path: '/budget', label: 'Budget', icon: '💰' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/nutrition', label: 'Nutrition', icon: '🥗' },
    { path: '/recipes', label: 'Recipes', icon: '👨‍🍳' },
    { path: '/meal-plan', label: 'Meal Plan', icon: '📅' },
    { path: '/shopping-list', label: 'Shopping', icon: '🛒' },
    { path: '/household', label: 'Household', icon: '👥' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];
  
  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 py-3">
            <span className="text-2xl">🛒</span>
            <span className="font-bold text-xl text-gray-800">GroceryTrack</span>
          </div>
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-1 py-3 px-3 border-b-2 font-medium text-xs transition-colors whitespace-nowrap ${
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
          <Route path="/scan" element={<ScanReceipt />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/meal-plan" element={<MealPlan />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/household" element={<Household />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/operational-insights" element={<OperationalInsights />} />
          <Route path="/ocr-testing" element={<OCRTestingDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 