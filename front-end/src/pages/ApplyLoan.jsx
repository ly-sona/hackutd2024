import React, { useState, useEffect } from 'react';
import './ApplyLoan.css';

const ApplyLoan = () => {
  const [loanAmount, setLoanAmount] = useState('');
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  useEffect(() => {
    // Enable the button only if conditions are met
    setIsButtonDisabled(!(loanAmount >= 1000 && isAgreementChecked));
  }, [loanAmount, isAgreementChecked]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setLoanAmount(value ? parseFloat(value) : '');
  };

  const handleCheckboxChange = (e) => {
    setIsAgreementChecked(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Loan application submitted for $${loanAmount}!`);
  };

  return (
    <div className="apply-loan-container">
      <form className="loan-box" onSubmit={handleSubmit}>
        {/* Loan Input Section */}
        <div className="loan-input-section">
          <h2>Apply for a Loan</h2>
          <label htmlFor="loan-amount">Loan Amount</label>
          <input
            id="loan-amount"
            type="number"
            value={loanAmount}
            onChange={handleAmountChange}
            placeholder="Enter amount"
            min="1000"
            step="100"
          />
          <p className="min-amount">
            Minimum loan amount is <strong>$1000</strong>
          </p>
        </div>

        {/* Terms Section */}
        <div className="terms-section">
          <h3>Terms of Your Agreement</h3>
          <p>State of Resident: <strong>Texas</strong></p>
          <p>Term: <strong>1 Year</strong></p>
          <p>
            Loan Amount: <strong>{loanAmount ? `$${loanAmount}` : '--'}</strong>
          </p>
          <p>Rate/APR: <strong>10%</strong></p>
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="agreement"
              checked={isAgreementChecked}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="agreement">
              I verify that I agree to the terms listed above.
            </label>
          </div>
          <button
            type="submit"
            className={`submit-button ${isButtonDisabled ? 'disabled' : ''}`}
            disabled={isButtonDisabled}
          >
            Apply
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyLoan;
