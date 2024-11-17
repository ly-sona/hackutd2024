// src/pages/LoanHistory.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './LoanHistory.css';

const LoanHistory = () => {
  const [loanHistory, setLoanHistory] = useState([]);
  const [totalLoanAmount, setTotalLoanAmount] = useState(0);

  useEffect(() => {
    fetchLoanHistory();
  }, []);

  const fetchLoanHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/loan_applications');
      setLoanHistory(response.data);

      // Calculate total loan amount
      const total = response.data.reduce((sum, application) => sum + application.loan_amount, 0);
      setTotalLoanAmount(total);
    } catch (error) {
      console.error('Error fetching loan history:', error);
    }
  };

  return (
    <div className="loan-history-container">
      <h1>Loan Overview</h1>

      <div className="flex-layout">
        {/* Graph Section */}
        <div className="graph-container">
          {/* Placeholder for graph, replace with an actual graph library */}
          <div className="graph-placeholder">Graph Placeholder</div>
        </div>

        {/* Loan Table Section */}
        <div>
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Age</th>
                <th>Income</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Term</th>
                <th>Approval</th>
                <th>Default</th>
              </tr>
            </thead>
            <tbody>
              {loanHistory.map((application) => (
                <tr key={application.id}>
                  <td>{application.id}</td>
                  <td>{application.age}</td>
                  <td>{`$${application.income.toLocaleString()}`}</td>
                  <td>{application.employment_status}</td>
                  <td>{`$${application.loan_amount.toLocaleString()}`}</td>
                  <td>{`${application.loan_term} months`}</td>
                  <td>{`${(application.approval_probability * 100).toFixed(2)}%`}</td>
                  <td>{`${(application.default_risk * 100).toFixed(2)}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analyze Button */}
      <button className="analyze-btn">Analyze Loans</button>
    </div>
  );
};

export default LoanHistory;