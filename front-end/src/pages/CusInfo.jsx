import React, { useState } from 'react';
import './CusInfo.css';
import Tooltip from '../components/Tooltip';

const CusInfo = () => {
  // State variables for personal information
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [dependents, setDependents] = useState(0);
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [incomeBracket, setIncomeBracket] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');

  // State variables for monthly expenses
  const [monthlyRent, setMonthlyRent] = useState('');
  const [monthlyUtilities, setMonthlyUtilities] = useState('');
  const [monthlyInsurance, setMonthlyInsurance] = useState('');
  const [monthlyLoanPayments, setMonthlyLoanPayments] = useState('');
  const [monthlySubscriptions, setMonthlySubscriptions] = useState('');
  const [monthlyFoodCosts, setMonthlyFoodCosts] = useState('');
  const [monthlyMiscCosts, setMonthlyMiscCosts] = useState('');

  // State variables for loan details
  const [desiredLoanAmount, setDesiredLoanAmount] = useState('');
  const [desiredLoanAPR, setDesiredLoanAPR] = useState('');
  const [desiredLoanPeriod, setDesiredLoanPeriod] = useState('');
  const [loanApproved, setLoanApproved] = useState('');

  const [showDefaultInfo, setShowDefaultInfo] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Collect all data
    const customerData = {
      name,
      ageGroup,
      maritalStatus,
      dependents,
      employmentStatus,
      incomeBracket,
      savingsAmount,
      monthlyExpenses: {
        rent: monthlyRent,
        utilities: monthlyUtilities,
        insurance: monthlyInsurance,
        loanPayments: monthlyLoanPayments,
        subscriptions: monthlySubscriptions,
        foodCosts: monthlyFoodCosts,
        miscCosts: monthlyMiscCosts,
      },
      desiredLoanAmount,
      desiredLoanAPR,
      desiredLoanPeriod,
      loanApproved,
    };

    // Redirect or show information based on loan approval
    if (loanApproved === 'Yes') {
      setShowDefaultInfo(true);
    } else {
      alert('Your information has been submitted!');
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="text-lg font-bold">Customer Information</h1>
      {!showDefaultInfo ? (
        <form className="customer-info-form" onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className="form-section">
            <h2>Personal Information</h2>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label>
              <Tooltip
                term="Age Group"
                definition="Select the range that includes your current age."
              />
              :
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                required
              >
                <option value="">Select Age Group</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-45">36-45</option>
                <option value="46-55">46-55</option>
                <option value="56-65">56-65</option>
                <option value="66+">66+</option>
              </select>
            </label>
            <label>
              <Tooltip
                term="Marital Status"
                definition="Your current legal relationship status."
              />
              :
              <select
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                required
              >
                <option value="">Select Marital Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </label>
            <label>
              <Tooltip
                term="Number of Dependents"
                definition="People who rely on you financially, like children."
              />
              :
              <input
                type="number"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
                min="0"
                required
              />
            </label>
            <label>
              <Tooltip
                term="Employment Status"
                definition="Your current work situation."
              />
              :
              <select
                value={employmentStatus}
                onChange={(e) => setEmploymentStatus(e.target.value)}
                required
              >
                <option value="">Select Employment Status</option>
                <option value="Employed">Employed</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Student">Student</option>
                <option value="Retired">Retired</option>
              </select>
            </label>
            <label>
              <Tooltip
                term="Household Income Bracket"
                definition="Your total annual income before taxes."
              />
              :
              <select
                value={incomeBracket}
                onChange={(e) => setIncomeBracket(e.target.value)}
                required
              >
                <option value="">Select Income Bracket</option>
                <option value="<$25,000">Less than $25,000</option>
                <option value="$25,000-$50,000">$25,000 - $50,000</option>
                <option value="$50,000-$75,000">$50,000 - $75,000</option>
                <option value="$75,000-$100,000">$75,000 - $100,000</option>
                <option value=">$100,000">More than $100,000</option>
              </select>
            </label>
            <label>
              <Tooltip
                term="Approximate Savings Amount"
                definition="The total money you have saved."
              />
              :
              <input
                type="number"
                value={savingsAmount}
                onChange={(e) => setSavingsAmount(e.target.value)}
                min="0"
                required
              />
            </label>
          </div>

          {/* Monthly Expenses Section */}
          <div className="form-section">
            <h2>Monthly Expenses</h2>
            <label>
              <Tooltip
                term="Rent/Mortgage"
                definition="Your monthly payment for housing."
              />
              :
              <input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                min="0"
                required
              />
            </label>
            <label>
              <Tooltip
                term="Utilities"
                definition="Monthly costs for services like electricity and water."
              />
              :
              <input
                type="number"
                value={monthlyUtilities}
                onChange={(e) => setMonthlyUtilities(e.target.value)}
                min="0"
                required
              />
            </label>
            <label>
              <Tooltip
                term="Insurance"
                definition="Monthly payments for insurance policies."
              />
              :
              <input
                type="number"
                value={monthlyInsurance}
                onChange={(e) => setMonthlyInsurance(e.target.value)}
                min="0"
                required
              />
            </label>
            <label>
              <Tooltip
                term="Loan Payments"
                definition="Monthly payments towards any existing loans."
              />
              :
              <input
                type="number"
                value={monthlyLoanPayments}
                onChange={(e) => setMonthlyLoanPayments(e.target.value)}
                min="0"
                required
              />
            </label>
            <label>
              <Tooltip
                term="Subscriptions"
                definition="Monthly costs for services like streaming or gym memberships."
              />
              :
              <input
                type="number"
                value={monthlySubscriptions}
                onChange={(e) => setMonthlySubscriptions(e.target.value)}
                min="0"
                required
              />
            </label>
            <label>
              <Tooltip
                term="Food Costs"
                definition="Monthly expenses on groceries and dining out."
              />
              :
              <input
                type="number"
                value={monthlyFoodCosts}
                onChange={(e) => setMonthlyFoodCosts(e.target.value)}
                min="0"
                required
              />
            </label>
            <label>
              <Tooltip
                term="Miscellaneous Costs"
                definition="Other monthly expenses not listed above."
              />
              :
              <input
                type="number"
                value={monthlyMiscCosts}
                onChange={(e) => setMonthlyMiscCosts(e.target.value)}
                min="0"
                required
              />
            </label>
          </div>

          {/* Loan Details Section */}
          <div className="form-section">
            <h2>Loan Details</h2>
            <label>
              <Tooltip
                term="Desired Loan Amount"
                definition="The amount of money you wish to borrow."
              />
              :
              <input
                type="number"
                value={desiredLoanAmount}
                onChange={(e) => setDesiredLoanAmount(e.target.value)}
                min="0"
                required
              />
            </label>
            <label>
              <Tooltip
                term="Desired Loan APR (%)"
                definition="The annual interest rate for the loan."
              />
              :
              <input
                type="number"
                value={desiredLoanAPR}
                onChange={(e) => setDesiredLoanAPR(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </label>
            <label>
              <Tooltip
                term="Desired Loan Period (months)"
                definition="How long you want to take to repay the loan."
              />
              :
              <input
                type="number"
                value={desiredLoanPeriod}
                onChange={(e) => setDesiredLoanPeriod(e.target.value)}
                min="1"
                required
              />
            </label>
            <label>
              <Tooltip
                term="Loan Approved"
                definition="Has your loan application been accepted?"
              />
              :
              <select
                value={loanApproved}
                onChange={(e) => setLoanApproved(e.target.value)}
                required
              >
                <option value="">Select an option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
          </div>

          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      ) : (
        <div className="default-risk-info">
          <h2>Default Risk Information</h2>
          <p>
            Defaulting on a loan means failing to repay it according to the
            agreed terms. This can lead to serious consequences, including
            damage to your credit score and legal actions.
          </p>
          <p>
            Based on your provided information, please proceed to the Default
            Risk page for a detailed analysis.
          </p>
          {/* Add a link or redirect to the Default Risk page */}
        </div>
      )}
    </div>
  );
};

export default CusInfo;
