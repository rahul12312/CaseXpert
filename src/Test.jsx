import React from 'react';

const Test = () => {
  console.log('Test component loaded successfully!');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      border: '2px solid #333',
      margin: '20px'
    }}>
      <h1 style={{ color: '#333', fontSize: '24px', fontWeight: 'bold' }}>
        ✅ React is Working!
      </h1>
      <p style={{ color: '#666', marginTop: '10px' }}>
        If you can see this, React is rendering correctly.
      </p>
      <p style={{ color: '#666', marginTop: '10px' }}>
        Current time: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

export default Test;
