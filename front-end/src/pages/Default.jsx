import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Default.css';

const Default = () => {
  const [loanHistory, setLoanHistory] = useState([]);
  const [totalLoanAmount, setTotalLoanAmount] = useState(0);
  const [averageIncome, setAverageIncome] = useState(0);
  const [error, setError] = useState('');

  // Backend API Base URL
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchLoanHistory();
  }, []);

  const fetchLoanHistory = async () => {
    try {
      setError('');
      const response = await axios.get(`${API_BASE_URL}/loan_applications`);
      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error('Unexpected response format');
      }

      // Map through data and ensure field names are correct
      const updatedData = data.map((application) => {
        const {
          income_bracket, // Adjusted field name
          loan_amount = 0, // Adjusted field name
          age_group,
          employment_status,
          loan_period = 0, // Adjusted field name
          prediction = 0,
        } = application;

        // Map income_bracket to income
        let income = 0;
        switch (income_bracket) {
          case '<$25,000':
            income = 20000;
            break;
          case '$25,000-$50,000':
            income = 37500;
            break;
          case '$50,000-$75,000':
            income = 62500;
            break;
          case '$75,000-$100,000':
            income = 87500;
            break;
          case '>$100,000':
            income = 125000;
            break;
          default:
            income = 50000;
        }

        // Approximate age based on age group
        let age = 0;
        switch (age_group) {
          case '18-25':
            age = 22;
            break;
          case '26-35':
            age = 30;
            break;
          case '36-45':
            age = 40;
            break;
          case '46-55':
            age = 50;
            break;
          case '56-65':
            age = 60;
            break;
          case '66+':
            age = 70;
            break;
          default:
            age = 40;
        }

        // Use the prediction value from the API as defaultRisk
        const defaultRisk = prediction * 100;

        return {
          ...application,
          income,
          age,
          loan_amount,
          loan_term: loan_period,
          default_risk: defaultRisk.toFixed(2),
        };
      });

      setLoanHistory(updatedData);

      // Calculate total loan amount and average income
      const total = updatedData.reduce((sum, app) => sum + (app.loan_amount || 0), 0);
      const incomeTotal = updatedData.reduce((sum, app) => sum + (app.income || 0), 0);
      setTotalLoanAmount(total);
      setAverageIncome(incomeTotal / (updatedData.length || 1)); // Avoid division by zero
    } catch (err) {
      console.error('Error fetching loan history:', err);
      setError('Failed to fetch loan history. Please try again later.');
    }
  };

  return (
    <div className="loan-history-container">
      <h1>Default Risk Analysis</h1>

      {error && <p className="error-message">{error}</p>}

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
                <tr key={application.id || application.name}>
                  <td>{application.id || 'N/A'}</td>
                  <td>{application.age || 'N/A'}</td>
                  <td>${application.income?.toLocaleString() || 'N/A'}</td>
                  <td>{application.employment_status || 'N/A'}</td>
                  <td>${application.loan_amount?.toLocaleString() || 'N/A'}</td>
                  <td>{application.loan_term ? `${application.loan_term} months` : 'N/A'}</td>
                  <td>{application.default_risk || 'N/A'}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analyze Button */}
      <button className="analyze-btn" onClick={fetchLoanHistory}>
        Refresh Analysis
      </button>
    </div>
  );
};

export default Default;