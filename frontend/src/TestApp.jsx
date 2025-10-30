import React from 'react';

function TestApp() {
    return (
        <div style={{ 
            padding: '20px', 
            fontSize: '24px', 
            color: 'red',
            backgroundColor: 'yellow',
            minHeight: '100vh'
        }}>
            <h1>TEST - REACT IS WORKING!</h1>
            <p>If you can see this, React is mounting properly.</p>
            <p>Current time: {new Date().toLocaleString()}</p>
        </div>
    );
}

export default TestApp;