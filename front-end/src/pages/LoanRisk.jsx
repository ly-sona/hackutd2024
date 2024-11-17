import React, { useState } from 'react';
import './LoanRisk.css';
import { Bar } from 'react-chartjs-2';

const LoanRisk = () => {
  // State for customer data
  const [customerData, setCustomerData] = useState({
    name: '',
    age: '',
    income: '',
    employmentStatus: '',
    creditScore: '',
  });

  // State for loan data
  const [loanData, setLoanData] = useState({
    amount: '',
    term: '',
    interestRate: '',
  });

  // State for risk score and breakdown
  const [riskScore, setRiskScore] = useState(null);
  const [riskBreakdown, setRiskBreakdown] = useState(null);

  // Handle input changes
  const handleCustomerDataChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLoanDataChange = (e) => {
    const { name, value } = e.target;
    setLoanData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mock risk score calculation
    const score = calculateRiskScore(customerData, loanData);
    const breakdown = getRiskBreakdown(customerData, loanData);

    setRiskScore(score);
    setRiskBreakdown(breakdown);
  };

  const calculateRiskScore = (customerData, loanData) => {
    // Mock calculation logic
    let score = 0;

    // Simple mock logic
    score += customerData.creditScore ? parseInt(customerData.creditScore) / 10 : 0;
    score += customerData.income ? parseInt(customerData.income) / 10000 : 0;
    score -= loanData.amount ? parseInt(loanData.amount) / 10000 : 0;

    // Normalize score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return score.toFixed(2);
  };

  const getRiskBreakdown = (customerData, loanData) => {
    // Mock breakdown
    return {
      creditScoreImpact: customerData.creditScore ? (parseInt(customerData.creditScore) / 850) * 100 : 0,
      incomeImpact: customerData.income ? (parseInt(customerData.income) / 100000) * 100 : 0,
      loanAmountImpact: loanData.amount ? (parseInt(loanData.amount) / 100000) * 100 : 0,
    };
  };

  // Prepare data for charts
  const riskData = {
    labels: ['Credit Score', 'Income', 'Loan Amount'],
    datasets: [
      {
        label: 'Risk Factor Impact (%)',
        data: riskBreakdown
          ? [
              riskBreakdown.creditScoreImpact,
              riskBreakdown.incomeImpact,
              riskBreakdown.loanAmountImpact,
            ]
          : [0, 0, 0],
        backgroundColor: ['#7c6fa7', '#9e8fc8', '#514b67'],
      },
    ],
  };

  return (
    <div className="apply-loan-container">
      <form className="loan-box" onSubmit={handleSubmit}>
        {/* Customer Data Section */}
        <div className="customer-data-section">
          <h2>Customer Information</h2>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={customerData.name}
            onChange={handleCustomerDataChange}
            placeholder="Enter your name"
          />

          <label htmlFor="age">Age</label>
          <input
            id="age"
            name="age"
            type="number"
            value={customerData.age}
            onChange={handleCustomerDataChange}
            placeholder="Enter your age"
          />

          <label htmlFor="income">Annual Income ($)</label>
          <input
            id="income"
            name="income"
            type="number"
            value={customerData.income}
            onChange={handleCustomerDataChange}
            placeholder="Enter your annual income"
          />

          <label htmlFor="employmentStatus">Employment Status</label>
          <input
            id="employmentStatus"
            name="employmentStatus"
            type="text"
            value={customerData.employmentStatus}
            onChange={handleCustomerDataChange}
            placeholder="Enter your employment status"
          />

          <label htmlFor="creditScore">Credit Score</label>
          <input
            id="creditScore"
            name="creditScore"
            type="number"
            value={customerData.creditScore}
            onChange={handleCustomerDataChange}
            placeholder="Enter your credit score"
            min="300"
            max="850"
          />
        </div>

        {/* Loan Data Section */}
        <div className="loan-data-section">
          <h2>Preferred Loan Information</h2>
          <label htmlFor="amount">Loan Amount ($)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            value={loanData.amount}
            onChange={handleLoanDataChange}
            placeholder="Enter loan amount"
          />

          <label htmlFor="term">Loan Term (years)</label>
          <input
            id="term"
            name="term"
            type="number"
            value={loanData.term}
            onChange={handleLoanDataChange}
            placeholder="Enter loan term in years"
          />

          <label htmlFor="interestRate">Interest Rate (%)</label>
          <input
            id="interestRate"
            name="interestRate"
            type="number"
            value={loanData.interestRate}
            onChange={handleLoanDataChange}
            placeholder="Enter interest rate"
          />
        </div>

        <button type="submit" className="submit-button">
          Calculate Risk Score
        </button>
      </form>

      {riskScore && (
        <div className="risk-score-section">
          <h2>Predicted Risk Score</h2>
          <p>
            Your predicted risk score is: <strong>{riskScore}</strong>
          </p>

          <h3>Risk Breakdown</h3>
          <Bar data={riskData} />

          {/* Additional information can be added here */}
        </div>
      )}
    </div>
  );
};

export default LoanRisk;
