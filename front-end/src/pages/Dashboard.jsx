import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import 'chartjs-plugin-datalabels';
import anime from 'animejs';
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

// Apply global chart settings
ChartJS.defaults.color = '#eaeaea';
ChartJS.defaults.borderColor = '#444';

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loanData, setLoanData] = useState([]);
  const [approvalTrends, setApprovalTrends] = useState({ labels: [], data: [] });
  const [loanPurposeDistribution, setLoanPurposeDistribution] = useState({ labels: [], data: [] });
  const [defaultRiskTrends, setDefaultRiskTrends] = useState({ labels: [], data: [] });

  // New states for additional data
  const [targetInfo, setTargetInfo] = useState(null);
  const [creditHistory, setCreditHistory] = useState([]);
  const [loanDetails, setLoanDetails] = useState([]);

  useEffect(() => {
    fetchUserInfo();
    fetchLoanData();
    fetchApprovalTrends();
    fetchLoanPurposeDistribution();
    fetchDefaultRiskTrends();
    fetchTargetInfo();
    fetchCreditHistory();
    fetchLoanDetails();

    // Animation on component mount
    anime({
      targets: '.dashboard-container .section',
      translateY: [50, 0],
      opacity: [0, 1],
      delay: anime.stagger(100),
      easing: 'easeOutQuad',
    });
  }, []);

  // Fetch functions (same as before)

  // Define chart data with new color schemes

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      <div className="grid-container">
        {/* Left Column */}
        <div className="left-column">
          {/* Target Information Section */}
          {targetInfo && (
            <div className="section target-info-section">
              <h2>Financial Distress Indicator</h2>
              <p>
                {targetInfo.target === 1
                  ? 'Client experienced financial distress within two years.'
                  : 'Client did not experience financial distress within two years.'}
              </p>
            </div>
          )}

          {/* User Information Section */}
          {userInfo && (
            <div className="section user-info-section">
              <h2>Applicant Information</h2>
              <div className="user-info">
                <p>
                  <strong>Name:</strong> {userInfo.name}
                </p>
                <p>
                  <strong>Email:</strong> {userInfo.email}
                </p>
                <p>
                  <strong>Age:</strong> {userInfo.age}
                </p>
                <p>
                  <strong>Income:</strong> ${userInfo.income}
                </p>
                <p>
                  <strong>Employment Status:</strong> {userInfo.employment_status}
                </p>
              </div>
            </div>
          )}

          {/* Credit History Section */}
          {creditHistory.length > 0 && (
            <div className="section credit-history-section">
              <h2>Credit History</h2>
              <ul>
                {creditHistory.map((record, index) => (
                  <li key={index}>
                    <p>
                      <strong>Loan ID:</strong> {record.loan_id}
                    </p>
                    <p>
                      <strong>Status:</strong> {record.status}
                    </p>
                    <p>
                      <strong>Amount:</strong> ${record.amount}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Loan Details Section */}
          {loanDetails.length > 0 && (
            <div className="section loan-details-section">
              <h2>Loan Details</h2>
              <ul>
                {loanDetails.map((loan, index) => (
                  <li key={index}>
                    <p>
                      <strong>Purpose:</strong> {loan.purpose}
                    </p>
                    <p>
                      <strong>Amount:</strong> ${loan.amount}
                    </p>
                    <p>
                      <strong>Term:</strong> {loan.term} months
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Graphs Section */}
          <div className="graphs-section">
            <div className="graph-card">
              <h3>Approval Probability Trends</h3>
              <Line
                data={approvalChartData}
                options={{
                  plugins: {
                    legend: { display: false },
                    datalabels: { display: false },
                  },
                }}
              />
            </div>

            <div className="graph-card">
              <h3>Loan Purpose Distribution</h3>
              <Pie
                data={loanPurposeChartData}
                options={{
                  plugins: {
                    legend: { position: 'bottom' },
                    datalabels: { color: '#fff' },
                  },
                }}
              />
            </div>

            <div className="graph-card">
              <h3>Default Risk Trends</h3>
              <Line
                data={defaultRiskChartData}
                options={{
                  plugins: {
                    legend: { display: false },
                    datalabels: { display: false },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
