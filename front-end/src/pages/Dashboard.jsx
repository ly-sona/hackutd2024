// src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import './Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loanData, setLoanData] = useState([]);
  const [approvalTrends, setApprovalTrends] = useState({ labels: [], data: [] });
  const [loanPurposeDistribution, setLoanPurposeDistribution] = useState({ labels: [], data: [] });
  const [defaultRiskTrends, setDefaultRiskTrends] = useState({ labels: [], data: [] });

  useEffect(() => {
    fetchUserInfo();
    fetchLoanData();
    fetchApprovalTrends();
    fetchLoanPurposeDistribution();
    fetchDefaultRiskTrends();
  }, []);

  const fetchUserInfo = async () => {
    try {
      // Assuming an endpoint that returns user information
      const response = await axios.get('http://localhost:8000/user_info');
      setUserInfo(response.data);
    } catch (error) {
      console.error('Error fetching user information:', error);
    }
  };

  const fetchLoanData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/loan_applications');
      setLoanData(response.data);
    } catch (error) {
      console.error('Error fetching loan data:', error);
    }
  };

  const fetchApprovalTrends = async () => {
    try {
      const response = await axios.get('http://localhost:8000/approval_trends');
      setApprovalTrends(response.data);
    } catch (error) {
      console.error('Error fetching approval trends:', error);
    }
  };

  const fetchLoanPurposeDistribution = async () => {
    try {
      const response = await axios.get('http://localhost:8000/loan_purpose_distribution');
      setLoanPurposeDistribution(response.data);
    } catch (error) {
      console.error('Error fetching loan purpose distribution:', error);
    }
  };

  const fetchDefaultRiskTrends = async () => {
    try {
      const response = await axios.get('http://localhost:8000/default_risk_trends');
      setDefaultRiskTrends(response.data);
    } catch (error) {
      console.error('Error fetching default risk trends:', error);
    }
  };

  // Define chart data
  const approvalChartData = {
    labels: approvalTrends.labels,
    datasets: [
      {
        label: 'Approval Probability (%)',
        data: approvalTrends.data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const loanPurposeChartData = {
    labels: loanPurposeDistribution.labels,
    datasets: [
      {
        label: 'Loan Purpose Distribution',
        data: loanPurposeDistribution.data,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
        ],
      },
    ],
  };

  const defaultRiskChartData = {
    labels: defaultRiskTrends.labels,
    datasets: [
      {
        label: 'Default Risk (%)',
        data: defaultRiskTrends.data,
        fill: false,
        borderColor: 'rgba(255, 99, 132, 0.6)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {/* User Information Section */}
      {userInfo && (
        <div className="user-info-section">
          <h2>User Information</h2>
          <div className="user-info">
            <p><strong>Name:</strong> {userInfo.name}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Age:</strong> {userInfo.age}</p>
            <p><strong>Income:</strong> ${userInfo.income}</p>
            <p><strong>Employment Status:</strong> {userInfo.employment_status}</p>
          </div>
        </div>
      )}

      {/* Graphs Section */}
      <div className="graphs-section">
        <div className="graph-card">
          <h3>Approval Probability Trends</h3>
          <Line data={defaultRiskChartData} />
        </div>

        <div className="graph-card">
          <h3>Loan Purpose Distribution</h3>
          <Pie data={loanPurposeChartData} />
        </div>

        <div className="graph-card">
          <h3>Approval Probability Over Time</h3>
          <Bar data={approvalChartData} />
        </div>

        <div className="graph-card">
          <h3>Default Risk Trends</h3>
          <Line data={defaultRiskChartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;