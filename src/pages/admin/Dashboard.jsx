import React from 'react';

const Dashboard = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Admin Dashboard 🛠️</h1>
      <p style={{ color: '#555' }}>Welcome to the admin dashboard. This is the default page for admin users.</p>
    </div>
  );
};

export default Dashboard;
