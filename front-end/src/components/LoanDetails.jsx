// src/components/LoanDetails.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LoanDetails = ({ loanId }) => {
  const [loanDetails, setLoanDetails] = useState({});

  useEffect(() => {
    fetchLoanDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanId]);

  const fetchLoanDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/loan_applications/${loanId}`);
      setLoanDetails(response.data);
    } catch (error) {
      console.error('Error fetching loan details:', error);
    }
  };

  return (
    <div className="loan-details-container">
      <h3>Loan Details for Application ID: {loanId}</h3>
      <p>
        <strong>Applicant Name:</strong> {loanDetails.name || 'N/A'}
      </p>
      <p>
        <strong>Credit Score:</strong> {loanDetails.credit_score || 'N/A'}
      </p>
      <p>
        <strong>Loan Amount:</strong> {loanDetails.desired_loan_amount || 'N/A'}
      </p>
      <p>
        <strong>Approval Probability:</strong>{' '}
        {loanDetails.prediction !== undefined
          ? `${(loanDetails.prediction * 100).toFixed(2)}%`
          : 'N/A'}
      </p>
      <p>
        <strong>Default Risk:</strong>{' '}
        {loanDetails.default_risk !== undefined
          ? `${(loanDetails.default_risk * 100).toFixed(2)}%`
          : 'N/A'}
      </p>
      <p>
        <strong>Annual Income:</strong> {loanDetails.annual_income || 'N/A'}
      </p>
      <p>
        <strong>Debt-to-Income Ratio:</strong>{' '}
        {loanDetails.debt_to_income_ratio || 'N/A'}
      </p>
      <p>
        <strong>Employment Status:</strong> {loanDetails.employment_status || 'N/A'}
      </p>
      <p>
        <strong>Loan Purpose:</strong> {loanDetails.loan_purpose || 'N/A'}
      </p>
      <p>
        <strong>Loan Term:</strong> {loanDetails.loan_term || 'N/A'}
      </p>
      <p>
        <strong>Application Status:</strong> {loanDetails.application_status || 'N/A'}
      </p>
    </div>
  );
};

export default LoanDetails;