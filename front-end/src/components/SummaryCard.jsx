// src/components/SummaryCard.jsx
import React from 'react';
import { Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import './SummaryCard.css'; // Updated CSS

function SummaryCard({ title, value, icon, color, trend }) {
  return (
    <Card className="summary-card" bordered={false}>
      <div className="summary-card-content">
        <div className="summary-card-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="summary-card-info">
          <Statistic title={title} value={value} />
          {trend && (
            <div className="ant-statistic-content-extra">
              {trend.prefix === 'up' ? (
                <ArrowUpOutlined />
              ) : (
                <ArrowDownOutlined />
              )}
              <span>{trend.value}{trend.suffix}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default React.memo(SummaryCard);
