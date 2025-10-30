import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// Import our API client
import emergentAPI from './api/emergentClient';

// Receipt Detail Modal Component
function ReceiptDetailModal({ receipt, isOpen, onClose, onUpdate }) {
  if (!receipt || !isOpen) return null;

  const handleApprove = async () => {
    try {
      await emergentAPI.Receipt.update(receipt.id, {
        validation_status: 'approved'
      });
      onUpdate && onUpdate();
      onClose();
    } catch (error) {
      console.error('Error approving receipt:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) return;
    
    try {
      await emergentAPI.Receipt.delete(receipt.id);
      onUpdate && onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing_background': return 'bg-yellow-100 text-yellow-800';
      case 'review_insights': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Receipt Details</h2>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded ${getStatusColor(receipt.validation_status)}`}>
                {receipt.validation_status?.replace('_', ' ')}
              </span>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{receipt.supermarket}</h3>
                {receipt.store_location && (
                  <p className="text-gray-600">{receipt.store_location}</p>
                )}
                <p className="text-gray-500 text-sm">📅 {receipt.purchase_date}</p>
                {receipt.notes && (
                  <p className="text-gray-600 text-sm mt-2">📝 {receipt.notes}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">
                  {receipt.currency} {receipt.total_amount?.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {receipt.items?.length || 0} items
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          {receipt.items && receipt.items.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold mb-4">Items ({receipt.items.length})</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {receipt.items.map((item, index) => (
                  <div key={index} className="bg-white border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{item.canonical_name || item.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.category && (
                            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                              {item.category}
                            </span>
                          )}
                          {item.pack_size && <span className="mr-2">{item.pack_size}</span>}
                          {item.quantity && <span>Qty: {item.quantity}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {receipt.currency} {(item.total_price || item.unit_price || 0).toFixed(2)}
                        </div>
                        {item.unit_price && item.total_price !== item.unit_price && (
                          <div className="text-sm text-gray-500">
                            {receipt.currency} {item.unit_price.toFixed(2)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {receipt.receipt_insights && (
            <div className="mb-6">
              <h4 className="font-semibold mb-4">🤖 AI Insights</h4>
              <div className="bg-blue-50 rounded-lg p-4">
                {receipt.receipt_insights.summary && (
                  <div className="mb-4">
                    <p className="text-gray-700">{receipt.receipt_insights.summary}</p>
                  </div>
                )}
                {receipt.receipt_insights.highlights && receipt.receipt_insights.highlights.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">Highlights:</h5>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {receipt.receipt_insights.highlights.map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            {receipt.validation_status === 'review_insights' && (
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✓ Approve Receipt
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🗑 Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Receipts List Page
function ReceiptsPage() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const openReceiptDetail = (receipt) => {
    setSelectedReceipt(receipt);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReceipt(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processing_background': return 'bg-yellow-100 text-yellow-800';
      case 'review_insights': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
              <div
                key={receipt.id}
                onClick={() => openReceiptDetail(receipt)}
                className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{receipt.supermarket}</h3>
                    {receipt.store_location && (
                      <p className="text-gray-600">{receipt.store_location}</p>
                    )}
                    <p className="text-gray-500 text-sm">📅 {receipt.purchase_date}</p>
                    {receipt.notes && (
                      <p className="text-gray-600 text-sm mt-1">📝 {receipt.notes}</p>
                    )}
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${getStatusColor(receipt.validation_status)}`}>
                        {receipt.validation_status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {receipt.currency} {receipt.total_amount?.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {receipt.items?.length || 0} items
                    </div>
                    {receipt.validation_status === 'review_insights' && (
                      <div className="mt-2">
                        <span className="bg-blue-600 text-white px-3 py-1 text-xs rounded">
                          Ready to Review
                        </span>
                      </div>
                    )}
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

      <ReceiptDetailModal 
        receipt={selectedReceipt}
        isOpen={showModal}
        onClose={closeModal}
        onUpdate={loadReceipts}
      />
    </div>
  );
}

// Enhanced Dashboard Component
function Dashboard() {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, ready: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load recent receipts
      const receiptData = await emergentAPI.Receipt.find({}, '-created_date', 10);
      setReceipts(receiptData || []);

      // Calculate stats
      const total = receiptData?.length || 0;
      const pending = receiptData?.filter(r => r.validation_status === 'processing_background').length || 0;
      const ready = receiptData?.filter(r => r.validation_status === 'review_insights').length || 0;
      
      setStats({ total, pending, ready });
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-gray-600">Total Receipts</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-gray-600">Processing</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.ready}</div>
            <div className="text-gray-600">Ready to Review</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">
              £{receipts.reduce((sum, r) => sum + (r.total_amount || 0), 0).toFixed(2)}
            </div>
            <div className="text-gray-600">Total Spent</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/scan')}
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-lg transition-colors duration-200 text-left"
          >
            <div className="text-2xl mb-2">📱</div>
            <h3 className="text-xl font-semibold mb-2">Scan Receipt</h3>
            <p className="text-green-100">AI-powered scanning</p>
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
            onClick={() => navigate('/analytics')}
            className="bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg shadow-lg transition-colors duration-200 text-left"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-orange-100">Insights & trends</p>
          </button>
        </div>

        {/* Ready to Review Section */}
        {stats.ready > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">
                  🔍 {stats.ready} Receipt{stats.ready > 1 ? 's' : ''} Ready for Review
                </h3>
                <p className="text-blue-700">AI analysis complete. Review insights and approve receipts.</p>
              </div>
              <button
                onClick={() => navigate('/receipts')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Review Now
              </button>
            </div>
          </div>
        )}

        {/* Recent Receipts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Recent Receipts</h2>
            <button
              onClick={() => navigate('/receipts')}
              className="text-blue-600 hover:text-blue-700"
            >
              View All →
            </button>
          </div>
          
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
    { path: '/receipts', label: 'Receipts', icon: '📄' },
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
          <Route path="/receipts" element={<ReceiptsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 