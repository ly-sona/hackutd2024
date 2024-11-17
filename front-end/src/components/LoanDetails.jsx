// src/components/LoanDetails.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UploadLoanFile from './UploadLoanFile';

const LoanDetails = ({ loanId }) => {
  const [loanDetails, setLoanDetails] = useState({});
  const [ipfsUrl, setIpfsUrl] = useState('');

  useEffect(() => {
    fetchLoanDetails();
    fetchLoanFile();
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

  const fetchLoanFile = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/loan_applications/${loanId}/file`);
      if (response.data.ipfs_url) {
        setIpfsUrl(response.data.ipfs_url);
      }
    } catch (error) {
      console.error('Error fetching loan file:', error);
    }
  };

  const handleUploadSuccess = (data) => {
    setIpfsUrl(data.ipfs_url);
  };

  return (
    <div className="loan-details-container">
      <h3>Loan Details for Application ID: {loanId}</h3>
      <p><strong>Applicant Name:</strong> {loanDetails.applicant_name}</p>
      <p><strong>Credit Score:</strong> {loanDetails.credit_score}</p>
      <p><strong>Loan Amount:</strong> {loanDetails.loan_amount}</p>
      <p><strong>Approval Probability:</strong> {(loanDetails.approval_probability * 100).toFixed(2)}%</p>
      <p><strong>Default Risk:</strong> {(loanDetails.default_risk * 100).toFixed(2)}%</p>
      <h3>Uploaded Documents</h3>
      {ipfsUrl ? (
        <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
          View Document
        </a>
      ) : (
        <p>No document uploaded.</p>
      )}
      <UploadLoanFile loanId={loanId} onUploadSuccess={handleUploadSuccess} />
    </div>
  );
};

export default LoanDetails;