import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to the Dashboard! Here's a preview of your data:</p>
      <div className="mt-4">
        <h2 className="text-2xl mb-2">Mini Flag Table</h2>
        <Link to="/flagtable" className="text-blue-500 underline">
          View Full Table
        </Link>
        {/* Include a smaller version of the table if desired */}
      </div>
    </div>
  );
};

export default Dashboard;
