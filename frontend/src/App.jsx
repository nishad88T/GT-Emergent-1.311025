import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// Import our API client
import emergentAPI from './api/emergentClient';

// Import User Context Provider
import { UserProvider } from './components/shared/FeatureGuard';

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

// All page components are now imported from separate files

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