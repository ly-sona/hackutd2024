// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Spin, Alert, Table, Button } from 'antd';
import { FileDoneOutlined, WarningOutlined, PercentageOutlined } from '@ant-design/icons';
import SummaryCard from '../components/SummaryCard';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import './Dashboard.css'; // Updated CSS

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [totalClaims, setTotalClaims] = useState(null);
  const [flaggedClaims, setFlaggedClaims] = useState([]);
  const [fraudTrends, setFraudTrends] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch data from API endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);

        // Fetch total claims processed
        const fraudTrendsResponse = await axios.get('/fraud_trends');
        const total = fraudTrendsResponse.data.total_claims_processed;

        // Fetch flagged claims
        const flaggedClaimsResponse = await axios.get('/flagged_claims');
        const flagged = flaggedClaimsResponse.data.flagged_claims;

        // Fetch detailed flagged claims data (assuming API provides detailed data)
        const detailedFlaggedClaimsResponse = await axios.get('/flagged_claims/details');
        const detailedFlagged = detailedFlaggedClaimsResponse.data.flagged_claims_details;

        setTotalClaims(total);
        setFlaggedClaims(detailedFlagged);
        setFraudTrends(fraudTrendsResponse.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate Fraud Detection Rate
  const fraudDetectionRate = totalClaims && fraudTrends.flagged_claims
    ? ((fraudTrends.flagged_claims / totalClaims) * 100).toFixed(2)
    : 'N/A';

  // Prepare data for Bar Chart
  const chartData = {
    labels: fraudTrends.labels || [], // e.g., ['January', 'February', ...]
    datasets: [
      {
        label: 'Fraud Detection Rate (%)',
        data: fraudTrends.data || [], // e.g., [2.5, 3.0, ...]
        backgroundColor: 'rgba(46, 66, 52, 0.6)', // Forest Green with opacity
        borderColor: 'rgba(46, 66, 52, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
        },
      },
      title: {
        display: true,
        text: 'Fraud Detection Trends',
        color: '#ffffff',
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
      y: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
  };

  // Define columns for Flagged Claims Table
  const columns = [
    {
      title: 'Claim ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id.localeCompare(b.id),
      render: text => <a href={`/claims/${text}`}>{text}</a>,
    },
    {
      title: 'Fraud Score',
      dataIndex: 'fraud_score',
      key: 'fraud_score',
      sorter: (a, b) => a.fraud_score - b.fraud_score,
      render: score => score.toFixed(2),
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => (
        <Button type="link" onClick={() => viewDetails(record.id)}>
          View Details
        </Button>
      ),
    },
  ];

  const viewDetails = (claimId) => {
    // Implement navigation to claim details page or modal
    // For example, using React Router's useNavigate:
    // navigate(`/claims/${claimId}`);
    console.log(`View details for Claim ID: ${claimId}`);
  };

  return (
    <div className="dashboard-container">
      {loading ? (
        <div className="spinner-container">
          <Spin tip="Loading..." size="large" />
        </div>
      ) : error ? (
        <Alert
          message="Error"
          description="There was an error fetching the dashboard data."
          type="error"
          showIcon
        />
      ) : (
        <>
          {/* Summary Metrics Cards */}
          <Row gutter={[16, 16]} className="summary-cards-row">
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
                value={fraudTrends.flagged_claims || 0}
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

          {/* Flagged Claims Table */}
          <div className="table-container">
            <h2 className="section-title">Flagged Claims</h2>
            <Table
              dataSource={flaggedClaims}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              bordered
              scroll={{ x: '100%' }}
              className="flagged-claims-table"
            />
          </div>

          {/* Fraud Trends Bar Chart */}
          <div className="chart-container">
            <h2 className="section-title">Fraud Trends</h2>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;