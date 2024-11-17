import React, { useState } from 'react';
import './CusInfo.css';
import Tooltip from '../components/Tooltip';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CusInfo = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    ageGroup: '',
    maritalStatus: '',
    dependents: 0,
    employmentStatus: '',
    incomeBracket: '',
    savingsAmount: '',
    monthlyRent: '',
    monthlyUtilities: '',
    monthlyInsurance: '',
    monthlyLoanPayments: '',
    monthlySubscriptions: '',
    monthlyFoodCosts: '',
    monthlyMiscCosts: '',
    desiredLoanAmount: '',
    desiredLoanAPR: '',
    desiredLoanPeriod: '',
  });

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Construct the payload with correct field names
    const payload = {
      name: formData.name,
      age_group: formData.ageGroup,
      marital_status: formData.maritalStatus,
      number_of_dependents: parseInt(formData.dependents, 10) || 0,
      employment_status: formData.employmentStatus,
      household_income_bracket: formData.incomeBracket,
      approximate_savings_amount: parseFloat(formData.savingsAmount) || 0.0,
      monthly_rent_mortgage: parseFloat(formData.monthlyRent) || 0.0,
      monthly_utilities: parseFloat(formData.monthlyUtilities) || 0.0,
      monthly_insurance: parseFloat(formData.monthlyInsurance) || 0.0,
      monthly_loan_payments: parseFloat(formData.monthlyLoanPayments) || 0.0,
      monthly_subscriptions: parseFloat(formData.monthlySubscriptions) || 0.0,
      monthly_food_costs: parseFloat(formData.monthlyFoodCosts) || 0.0,
      monthly_misc_costs: parseFloat(formData.monthlyMiscCosts) || 0.0,
      desired_loan_amount: parseFloat(formData.desiredLoanAmount) || 0.0,
      desired_loan_apr: parseFloat(formData.desiredLoanAPR) || 0.0,
      desired_loan_period: parseInt(formData.desiredLoanPeriod, 10) || 0,
      created_at: new Date().toISOString(), // Optional: If backend expects a timestamp
    };    
  
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, payload);
      const { approval_probability, default_risk } = response.data;
  
      navigate('/loan-risk', { state: { approval_probability, default_risk, customerData: payload } });
    } catch (error) {
      console.error('Error submitting data:', error);
      alert('An error occurred while submitting your information. Please try again.');
    }
  };  

  return (
    <div className="dashboard-container">
      <h1>Customer Information</h1>
      <form className="customer-info-form" onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <div className="form-section">
          <h2>Personal Information</h2>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              name="ageGroup"
              value={formData.ageGroup}
              onChange={handleChange}
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
              name="maritalStatus"
              value={formData.maritalStatus}
              onChange={handleChange}
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
              name="dependents"
              value={formData.dependents}
              onChange={handleChange}
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
              name="employmentStatus"
              value={formData.employmentStatus}
              onChange={handleChange}
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
              name="incomeBracket"
              value={formData.incomeBracket}
              onChange={handleChange}
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
              name="savingsAmount"
              value={formData.savingsAmount}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
        </div>

        {/* Monthly Expenses Section */}
        <div className="form-section">
          <h2>Monthly Expenses</h2>
          {[
            { label: 'Rent/Mortgage', name: 'monthlyRent' },
            { label: 'Utilities', name: 'monthlyUtilities' },
            { label: 'Insurance', name: 'monthlyInsurance' },
            { label: 'Loan Payments', name: 'monthlyLoanPayments' },
            { label: 'Subscriptions', name: 'monthlySubscriptions' },
            { label: 'Food Costs', name: 'monthlyFoodCosts' },
            { label: 'Miscellaneous Costs', name: 'monthlyMiscCosts' },
          ].map(({ label, name }) => (
            <label key={name}>
              <Tooltip term={label} definition={`Your monthly ${label.toLowerCase()}.`} />
              :
              <input
                type="number"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                min="0"
                required
              />
            </label>
          ))}
        </div>

        {/* Loan Details Section */}
        <div className="form-section">
          <h2>Loan Details</h2>
          <label>
            Desired Loan Amount:
            <input
              type="number"
              name="desiredLoanAmount"
              value={formData.desiredLoanAmount}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
          <label>
            Desired Loan APR (%):
            <input
              type="number"
              name="desiredLoanAPR"
              value={formData.desiredLoanAPR}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
          <label>
            Desired Loan Period (Months):
            <input
              type="number"
              name="desiredLoanPeriod"
              value={formData.desiredLoanPeriod}
              onChange={handleChange}
              min="0"
              required
            />
          </label>
        </div>

        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default CusInfo;