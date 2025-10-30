import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>GroceryTrack App</h1>
      <div style={{ marginTop: '20px' }}>
        <button style={{ 
          backgroundColor: '#10b981', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px',
          fontSize: '16px'
        }}>
          Scan New Receipt
        </button>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h2>Dashboard</h2>
        <p>Welcome to GroceryTrack!</p>
        <p>This is a simplified version to test component loading.</p>
      </div>
    </div>
  );
}

export default App; 