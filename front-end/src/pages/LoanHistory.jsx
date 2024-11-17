// src/pages/LoanHistory.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './LoanHistory.css';

const LoanHistory = () => {
  const [loanHistory, setLoanHistory] = useState([]);

  useEffect(() => {
    fetchLoanHistory();
  }, []);

  const fetchLoanHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/loan_applications');
      setLoanHistory(response.data);
    } catch (error) {
      console.error('Error fetching loan history:', error);
    }
  };

  return (
    <div className="loan-history-container">
      <h1>Your Loan Applications</h1>
      <table className="history-table">
        <thead>
          <tr>
            <th>Application ID</th>
            <th>Age</th>
            <th>Income</th>
            <th>Employment Status</th>
            <th>Loan Amount</th>
            <th>Loan Term</th>
            <th>Approval Probability</th>
            <th>Default Risk</th>
          </tr>
        </thead>
        <tbody>
          {loanHistory.map((application) => (
            <tr key={application.id}>
              <td>{application.id}</td>
              <td>{application.age}</td>
              <td>{application.income}</td>
              <td>{application.employment_status}</td>
              <td>{application.loan_amount}</td>
              <td>{application.loan_term} months</td>
              <td>{(application.approval_probability * 100).toFixed(2)}%</td>
              <td>{(application.default_risk * 100).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LoanHistory;