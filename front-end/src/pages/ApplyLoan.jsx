// src/pages/ApplyLoan.jsx

import React, { useState } from 'react';
import axios from 'axios';
import './ApplyLoan.css';

const ApplyLoan = () => {
  const [formData, setFormData] = useState({
    age: '',
    income: '',
    employment_status: '',
    loan_amount: '',
    loan_term: '',
    loan_purpose: '',
  });

  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (
      !formData.age ||
      !formData.income ||
      !formData.employment_status ||
      !formData.loan_amount ||
      !formData.loan_term ||
      !formData.loan_purpose
    ) {
      setMessage('Please fill in all required fields.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/score_loan', formData);
      setPrediction(response.data);
      setMessage('Loan application submitted successfully!');
    } catch (error) {
      console.error('Error submitting loan application:', error);
      setMessage('Failed to submit loan application.');
    }
  };

  return (
    <div className="apply-loan-container">
      <h1>Apply for a Loan</h1>
      <form className="apply-loan-form" onSubmit={handleSubmit}>
        <label>
          Age:
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Income:
          <input
            type="number"
            name="income"
            value={formData.income}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Employment Status:
          <input
            type="text"
            name="employment_status"
            value={formData.employment_status}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Loan Amount:
          <input
            type="number"
            name="loan_amount"
            value={formData.loan_amount}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Loan Term (months):
          <input
            type="number"
            name="loan_term"
            value={formData.loan_term}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Loan Purpose:
          <input
            type="text"
            name="loan_purpose"
            value={formData.loan_purpose}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Submit Application</button>
      </form>

      {message && <p>{message}</p>}

      {prediction && (
        <div className="prediction-result">
          <h2>Prediction Result</h2>
          <p>
            <strong>Approval Probability:</strong> {(prediction.approval_probability * 100).toFixed(2)}%
          </p>
          <p>
            <strong>Default Risk:</strong> {(prediction.default_risk * 100).toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplyLoan;