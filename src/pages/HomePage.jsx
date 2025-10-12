import React from 'react';

const HomePage = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Welcome 👋</h1>
      <p style={{ color: '#555' }}>This is a sample landing page at path "/".</p>
    </div>
  );
};

export default HomePage;

