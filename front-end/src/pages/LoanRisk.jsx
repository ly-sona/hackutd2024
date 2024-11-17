import React, { useState, useEffect } from 'react';
import './LoanRisk.css';
import { Pie } from 'react-chartjs-2';
import { useLocation } from 'react-router-dom';

const LoanRisk = () => {
  const location = useLocation();
  const { customerData } = location.state || {};

  // **Add console.log to verify customerData**
  console.log('Received customerData:', customerData);

  if (!customerData) {
    return <p>No customer data available.</p>;
  }

  // **Destructure data with default values**
  const {
    name = '',
    ageGroup = '',
    maritalStatus = '',
    dependents = 0,
    employmentStatus = '',
    incomeBracket = '',
    savingsAmount = '0',
    monthlyExpenses = {},
    desiredLoanAmount = '0',
    desiredLoanAPR = '0',
    desiredLoanPeriod = '0',
  } = customerData;

  // **Ensure monthlyExpenses has default values**
  const defaultExpenses = {
    rent: '0',
    utilities: '0',
    insurance: '0',
    loanPayments: '0',
    subscriptions: '0',
    foodCosts: '0',
    miscCosts: '0',
  };

  const expenses = { ...defaultExpenses, ...monthlyExpenses };

  // **Helper function to safely parse numbers**
  const toNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // **Calculate total monthly expenses using expenses object**
  const totalMonthlyExpenses = Object.values(expenses).reduce(
    (acc, expense) => acc + toNumber(expense),
    0
  );

  // **Implement the calculateRiskScore function with safe parsing**
  const calculateRiskScore = () => {
    let score = 50; // Base score

    // Adjust score based on age group
    if (ageGroup === '18-25') score += 5;
    else if (ageGroup === '66+') score += 10;

    // Adjust score based on employment status
    if (employmentStatus === 'Unemployed') score += 20;
    else if (employmentStatus === 'Self-Employed') score += 10;

    // Adjust score based on income bracket
    if (incomeBracket === '<$25,000') score += 20;
    else if (incomeBracket === '>$100,000') score -= 10;

    // Adjust score based on savings amount
    if (toNumber(savingsAmount) < 5000) score += 10;
    else if (toNumber(savingsAmount) > 50000) score -= 10;

    // Adjust score based on monthly expenses
    if (totalMonthlyExpenses > 2000) score += 10;

    // Adjust score based on desired loan amount
    if (toNumber(desiredLoanAmount) > 50000) score += 15;

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return score.toFixed(2);
  };

  const riskScore = calculateRiskScore();

  // **Risk breakdown with safe number parsing**
  const riskBreakdown = {
    Age: ageGroup === '18-25' || ageGroup === '66+' ? 10 : 5,
    Employment:
      employmentStatus === 'Unemployed'
        ? 20
        : employmentStatus === 'Self-Employed'
        ? 10
        : 5,
    Income: incomeBracket === '<$25,000' ? 20 : 5,
    Savings: toNumber(savingsAmount) < 5000 ? 10 : 5,
    Expenses: totalMonthlyExpenses > 2000 ? 10 : 5,
    LoanAmount: toNumber(desiredLoanAmount) > 50000 ? 15 : 5,
  };

  // **Prepare data for the pie chart with safe parsing**
  const pieData = {
    labels: Object.keys(riskBreakdown),
    datasets: [
      {
        data: Object.values(riskBreakdown).map(toNumber),
        backgroundColor: [
          '#7c6fa7',
          '#9e8fc8',
          '#514b67',
          '#a9a3c4',
          '#d1c8e6',
          '#34304a',
        ],
      },
    ],
  };

  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(
          'http://localhost:5000/api/generate-risk-analysis',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(customerData),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // **Ensure analysis is a string**
        setAnalysis(data.analysis || 'Analysis could not be generated.');
      } catch (error) {
        console.error('Error fetching analysis:', error);
        setAnalysis('An error occurred while generating the analysis.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [customerData]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="loan-risk-container">
      <h1>Loan Risk Analysis for {name}</h1>
      <div className="risk-score-section">
        <h2>Your Risk Score: {riskScore}</h2>
        <p>
          A lower risk score indicates a lower risk of defaulting on the loan.
          Scores are calculated based on several factors from your provided
          information.
        </p>
      </div>
      <div className="risk-chart-section">
        <h3>Risk Factors Breakdown</h3>
        {/* **Wrap Pie chart in a conditional to ensure data is valid** */}
        {pieData && <Pie data={pieData} />}
      </div>
      <div className="risk-details-section">
        <h3>Risk Analysis Details</h3>
        <p>{analysis}</p>
      </div>
    </div>
  );
};

export default LoanRisk;
