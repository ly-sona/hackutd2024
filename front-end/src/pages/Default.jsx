// src/pages/Default.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Default.css';

const Default = () => {
  const [loanHistory, setLoanHistory] = useState([]);
  const [totalLoanAmount, setTotalLoanAmount] = useState(0);
  const [averageIncome, setAverageIncome] = useState(0);

  useEffect(() => {
    fetchLoanHistory();
  }, []);

  const fetchLoanHistory = async () => {
    try {
      const response = await axios.get('http://localhost:8000/loan_applications');
      const data = response.data;

      // Calculate default risk for each application
      const updatedData = data.map((application) => {
        const { income, loan_amount, age } = application;

        // Simple risk assessment logic
        const loanToIncomeRatio = (loan_amount / income) * 100;
        let defaultRisk = loanToIncomeRatio;

        // Adjust risk based on age
        if (age < 25) {
          defaultRisk += 10;
        } else if (age > 60) {
          defaultRisk += 5;
        }

        // Clamp default risk between 0% and 100%
        defaultRisk = Math.min(Math.max(defaultRisk, 0), 100);

        return {
          ...application,
          default_risk: defaultRisk.toFixed(2),
        };
      });

      setLoanHistory(updatedData);

      // Calculate total loan amount and average income
      const total = updatedData.reduce((sum, app) => sum + app.loan_amount, 0);
      const incomeTotal = updatedData.reduce((sum, app) => sum + app.income, 0);
      setTotalLoanAmount(total);
      setAverageIncome(incomeTotal / updatedData.length);
    } catch (error) {
      console.error('Error fetching loan history:', error);
    }
  };

  return (
    <div className="loan-history-container">
      <h1>Default Risk Analysis</h1>

      <div className="overview">
        <div className="total-loan-amount">
          <h2>Total Loan Amount</h2>
          <p>${totalLoanAmount.toLocaleString()}</p>
        </div>
        <div className="average-income">
          <h2>Average Income</h2>
          <p>${averageIncome.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex-layout">
        {/* Graph Section */}
        <div className="graph-container">
          {/* Placeholder for graph, replace with actual graph implementation */}
          <div className="graph-placeholder">Default Risk Graph Placeholder</div>
        </div>

        {/* Loan Table Section */}
        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Age</th>
                <th>Income</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Term</th>
                <th>Default Risk</th>
              </tr>
            </thead>
            <tbody>
              {loanHistory.map((application) => (
                <tr key={application.id}>
                  <td>{application.id}</td>
                  <td>{application.age}</td>
                  <td>${application.income.toLocaleString()}</td>
                  <td>{application.employment_status}</td>
                  <td>${application.loan_amount.toLocaleString()}</td>
                  <td>{application.loan_term} months</td>
                  <td>{application.default_risk}%</td>
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

export default Default;
