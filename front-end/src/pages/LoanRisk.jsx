import React from 'react';
import { useLocation } from 'react-router-dom';
import './LoanRisk.css';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';

// Register necessary Chart.js components
Chart.register(ArcElement, ChartTooltip, Legend);

const LoanRisk = () => {
  const location = useLocation();
  const { approval_probability, default_risk, customerData } = location.state || {};

  // Check if prediction data is available
  if (
    approval_probability === undefined ||
    default_risk === undefined ||
    !customerData
  ) {
    return <div>No prediction data available.</div>;
  }

  // Destructure data from customerData
  const {
    name,
    age_group: ageGroup,
    marital_status: maritalStatus,
    number_of_dependents: dependents,
    employment_status: employmentStatus,
    household_income_bracket: incomeBracket,
    approximate_savings_amount: savingsAmount,
    monthly_rent_mortgage,
    monthly_utilities,
    monthly_insurance,
    monthly_loan_payments,
    monthly_subscriptions,
    monthly_food_costs,
    monthly_misc_costs,
    desired_loan_amount: desiredLoanAmount,
    desired_loan_apr: desiredLoanAPR,
    desired_loan_period: desiredLoanPeriod,
  } = customerData;

  // Calculate total monthly expenses
  const totalMonthlyExpenses =
    monthly_rent_mortgage +
    monthly_utilities +
    monthly_insurance +
    monthly_loan_payments +
    monthly_subscriptions +
    monthly_food_costs +
    monthly_misc_costs;

  // Mock risk score calculation
  const calculateRiskScore = () => {
    let score = 50; // Base score

    // Adjust score based on age group
    if (ageGroup === '18-25') score += 5;
    if (ageGroup === '66+') score += 10;

    // Adjust score based on employment status
    if (employmentStatus === 'Unemployed') score += 20;
    if (employmentStatus === 'Self-Employed') score += 10;

    // Adjust score based on income bracket
    if (incomeBracket === '<$25,000') score += 20;
    if (incomeBracket === '>$100,000') score -= 10;

    // Adjust score based on savings amount
    if (savingsAmount < 5000) score += 10;
    if (savingsAmount > 50000) score -= 10;

    // Adjust score based on monthly expenses
    if (totalMonthlyExpenses > 2000) score += 10;

    // Adjust score based on desired loan amount
    if (desiredLoanAmount > 50000) score += 15;

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return score.toFixed(2);
  };

  const riskScore = calculateRiskScore();

  // Risk breakdown for the pie chart
  const riskBreakdown = {
    Age: ageGroup === '18-25' || ageGroup === '66+' ? 20 : 10,
    Employment:
      employmentStatus === 'Unemployed'
        ? 30
        : employmentStatus === 'Self-Employed'
        ? 20
        : 10,
    Income: incomeBracket === '<$25,000' ? 30 : 10,
    Savings: savingsAmount < 5000 ? 20 : 10,
    Expenses: totalMonthlyExpenses > 2000 ? 20 : 10,
    LoanAmount: desiredLoanAmount > 50000 ? 30 : 10,
  };

  // Prepare data for the pie chart
  const pieData = {
    labels: Object.keys(riskBreakdown),
    datasets: [
      {
        data: Object.values(riskBreakdown),
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

  return (
    <div className="loan-risk-container">
      <h1>Loan Risk Analysis for {name}</h1>
      <div className="risk-score-section">
        <h2>Your Approval Probability: {(approval_probability * 100).toFixed(2)}%</h2>
        <h2>Your Default Risk: {(default_risk * 100).toFixed(2)}%</h2>
        <p>
          A lower default risk indicates a lower risk of defaulting on the loan.
          Approval probability and default risk are calculated based on your provided
          information.
        </p>
      </div>
      <div className="risk-chart-section">
        <h3>Risk Factors Breakdown</h3>
        <Pie data={pieData} />
      </div>
      <div className="risk-details-section">
        <h3>Risk Analysis Details</h3>
        <ul>
          <li>
            <strong>Age Group:</strong> {ageGroup}
          </li>
          <li>
            <strong>Marital Status:</strong> {maritalStatus}
          </li>
          <li>
            <strong>Dependents:</strong> {dependents}
          </li>
          <li>
            <strong>Employment Status:</strong> {employmentStatus}
          </li>
          <li>
            <strong>Income Bracket:</strong> {incomeBracket}
          </li>
          <li>
            <strong>Savings Amount:</strong> ${savingsAmount}
          </li>
          <li>
            <strong>Total Monthly Expenses:</strong> ${totalMonthlyExpenses.toFixed(2)}
          </li>
          <li>
            <strong>Desired Loan Amount:</strong> ${desiredLoanAmount}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LoanRisk;