// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Alert, Table, Button } from 'antd';
import {
  FileDoneOutlined,
  WarningOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import SummaryCard from '../components/SummaryCard';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './Dashboard.css'; // Optional: For additional styling

function Dashboard() {
  // State variables for Summary Metrics
  const [totalClaims, setTotalClaims] = useState(null);
  const [flaggedClaimsCount, setFlaggedClaimsCount] = useState(null);
  const [fraudDetectionRate, setFraudDetectionRate] = useState(null);

  // State variables for Flagged Claims Table
  const [flaggedClaims, setFlaggedClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(true);
  const [claimsError, setClaimsError] = useState(false);

  // State variables for Fraud Trends Chart
  const [fraudTrends, setFraudTrends] = useState({});
  const [trendsLoading, setTrendsLoading] = useState(true);
  const [trendsError, setTrendsError] = useState(false);

  // Combined loading and error states for summary metrics
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState(false);

  // Fetch Summary Metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setMetricsLoading(true);
        setMetricsError(false);

        // Fetch total claims processed
        const fraudTrendsResponse = await axios.get('http://localhost:8000/fraud_trends');
        const total = fraudTrendsResponse.data.total_claims_processed;

        // Fetch flagged claims count
        const flaggedClaimsResponse = await axios.get('http://localhost:8000/flagged_claims');
        const flagged = flaggedClaimsResponse.data.flagged_claims;

        // Calculate Fraud Detection Rate
        const rate = ((flagged / total) * 100).toFixed(2);

        setTotalClaims(total);
        setFlaggedClaimsCount(flagged);
        setFraudDetectionRate(rate);

        setMetricsLoading(false);
      } catch (err) {
        console.error('Error fetching summary metrics:', err);
        setMetricsError(true);
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Fetch Flagged Claims Table Data
  useEffect(() => {
    const fetchFlaggedClaims = async () => {
      try {
        setClaimsLoading(true);
        setClaimsError(false);

        const response = await axios.get('http://localhost:8000/api/flagged_claims');
        setFlaggedClaims(response.data);
        setClaimsLoading(false);
      } catch (err) {
        console.error('Error fetching flagged claims:', err);
        setClaimsError(true);
        setClaimsLoading(false);
      }
    };

    fetchFlaggedClaims();
  }, []);

  // Fetch Fraud Trends Data
  useEffect(() => {
    const fetchFraudTrends = async () => {
      try {
        setTrendsLoading(true);
        setTrendsError(false);

        const response = await axios.get('http://localhost:8000/api/fraud_trends');
        setFraudTrends(response.data);
        setTrendsLoading(false);
      } catch (err) {
        console.error('Error fetching fraud trends:', err);
        setTrendsError(true);
        setTrendsLoading(false);
      }
    };

    fetchFraudTrends();
  }, []);

  // Data for Fraud Trends Bar Chart
  const chartData = {
    labels: fraudTrends.labels || [],
    datasets: [
      {
        label: 'Fraud Detection Rate (%)',
        data: fraudTrends.data || [],
        backgroundColor: 'rgba(52, 152, 219, 0.6)', // Light Blue
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Options for Fraud Trends Bar Chart
  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
    maintainAspectRatio: false,
  };

  // Columns for Flagged Claims Table
  const columns = [
    {
      title: 'Claim ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Fraud Score',
      dataIndex: 'fraud_score',
      key: 'fraud_score',
      render: (score) => score.toFixed(2),
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => <Button type="link">View Details</Button>,
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Summary Metrics */}
      {metricsLoading ? (
        <Spin tip="Loading Summary Metrics..." size="large" />
      ) : metricsError ? (
        <Alert
          message="Error"
          description="There was an error fetching the summary metrics."
          type="error"
          showIcon
        />
      ) : (
        <Row gutter={[16, 16]} className="summary-metrics-row">
          <Col xs={24} sm={12} md={8}>
            <SummaryCard
              title="Total Claims Processed"
              value={totalClaims}
              icon={<FileDoneOutlined style={{ fontSize: '24px', color: '#fff' }} />}
              color="#1890ff" // Ant Design blue
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <SummaryCard
              title="Flagged Claims"
              value={flaggedClaimsCount}
              icon={<WarningOutlined style={{ fontSize: '24px', color: '#fff' }} />}
              color="#f5222d" // Ant Design red
            />
          </Col>
          <Col xs={24} sm={24} md={8}>
            <SummaryCard
              title="Fraud Detection Rate"
              value={`${fraudDetectionRate}%`}
              icon={<PercentageOutlined style={{ fontSize: '24px', color: '#fff' }} />}
              color="#52c41a" // Ant Design green
              trend={{
                value: '+2.5%',
                precision: 1,
                color: '#52c41a', // Green for positive trend
                prefix: 'up', // 'up' for increase, 'down' for decrease
                suffix: '',
              }}
            />
          </Col>
        </Row>
      )}

      {/* Flagged Claims Table */}
      <div className="flagged-claims-section">
        <h2>Flagged Claims</h2>
        {claimsLoading ? (
          <Spin tip="Loading Flagged Claims..." />
        ) : claimsError ? (
          <Alert
            message="Error"
            description="There was an error fetching the flagged claims."
            type="error"
            showIcon
          />
        ) : (
          <Table
            dataSource={flaggedClaims}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            bordered
          />
        )}
      </div>

      {/* Fraud Trends Bar Chart */}
      <div className="fraud-trends-section">
        <h2>Fraud Trends</h2>
        {trendsLoading ? (
          <Spin tip="Loading Fraud Trends..." />
        ) : trendsError ? (
          <Alert
            message="Error"
            description="There was an error fetching the fraud trends data."
            type="error"
            showIcon
          />
        ) : (
          <div className="chart-container">
            <Bar data={chartData} options={chartOptions} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;