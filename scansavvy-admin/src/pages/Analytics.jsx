// Analytics.jsx
import React from 'react';
import { BarChart2, TrendingUp, Users, DollarSign } from 'lucide-react';
import '../css/Analytics.css';

const Analytics = () => {
  const analyticsData = {
    metrics: [
      { title: 'Total Revenue', value: '$84,254', growth: '+14.5%', icon: DollarSign },
      { title: 'Active Users', value: '2,854', growth: '+8.2%', icon: Users },
      { title: 'Conversion Rate', value: '4.2%', growth: '+2.4%', icon: TrendingUp },
      { title: 'Avg. Session', value: '12m 24s', growth: '+1.8%', icon: BarChart2 }
    ],
    revenueData: [
      { month: 'Jan', value: 4200 },
      { month: 'Feb', value: 5800 },
      { month: 'Mar', value: 5200 },
      { month: 'Apr', value: 7800 },
      { month: 'May', value: 6200 },
      { month: 'Jun', value: 8400 }
    ]
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        {/* <h1>Analytics Overview</h1> */}
        <p>Detailed metrics and performance analysis</p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {analyticsData.metrics.map((metric, index) => (
          <div key={index} className="metric-card">
            <div className="metric-icon">
              <metric.icon size={24} />
            </div>
            <div className="metric-info">
              <h3>{metric.title}</h3>
              <div className="metric-values">
                <span className="metric-value">{metric.value}</span>
                <span className={`metric-growth ${parseFloat(metric.growth) > 0 ? 'positive' : 'negative'}`}>
                  {metric.growth}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="analytics-charts">
        <div className="chart-container">
          <h2>Revenue Trends</h2>
          <div className="chart-content">
            <div className="chart-placeholder">
              [Revenue Chart Would Go Here]
            </div>
          </div>
        </div>

        <div className="chart-container">
          <h2>User Activity</h2>
          <div className="chart-content">
            <div className="chart-placeholder">
              [User Activity Chart Would Go Here]
            </div>
          </div>
        </div>
      </div>

      {/* Details Table */}
      <div className="analytics-table">
        <h2>Detailed Statistics</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue</th>
              <th>Growth</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.revenueData.map((data, index) => (
              <tr key={index}>
                <td>{data.month}</td>
                <td>${data.value}</td>
                <td className="growth-cell positive">+{((data.value / 4000 - 1) * 100).toFixed(1)}%</td>
                <td>
                  <span className="status-badge success">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analytics;