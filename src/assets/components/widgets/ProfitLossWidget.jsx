import React, { useState, useEffect } from 'react';
import api from '../../../service/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './ProfitLossWidget.css';
import { FaArrowTrendUp, FaArrowTrendDown } from 'react-icons/fa6';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProfitLossWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfitLoss = async () => {
      try {
        const response = await api.get('/insights/profit-loss');
        const chartData = processData(response.data);
        setData(chartData);
      } catch (error) {
        console.error('Failed to fetch P&L data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfitLoss();
  }, []);

  const processData = (rawData) => {
    const labels = rawData.map(d => new Date(d.month).toLocaleString('default', { month: 'short' }));
    const incomeData = rawData.map(d => d.totalIncome);
    const expenseData = rawData.map(d => d.totalExpense);
    const totalProfit = rawData.reduce((acc, curr) => acc + (curr.totalIncome - curr.totalExpense), 0);

    return {
      labels,
      datasets: [
        {
          label: 'Total Income',
          data: incomeData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Total Expense',
          data: expenseData,
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
      totalProfit,
    };
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#e5e7eb',
          boxWidth: 20,
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' }
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { display: false }
      }
    }
  };

  if (loading) {
    return <div className="widget-loading">Calculating Profit & Loss...</div>;
  }

  if (!data || data.labels.length === 0) {
    return <div className="empty-message">Not enough data to display P&L.</div>;
  }

  return (
    <div className="pl-widget-container">
        <div className="pl-summary">
            <span className="summary-title">6-Month Net Profit</span>
            <span className={`summary-amount ${data.totalProfit >= 0 ? 'profit' : 'loss'}`}>
                {data.totalProfit >= 0 ? <FaArrowTrendUp /> : <FaArrowTrendDown />}
                ₹{data.totalProfit.toLocaleString()}
            </span>
        </div>
        <div className="pl-chart-container">
            <Bar options={chartOptions} data={data} />
        </div>
    </div>
  );
};

export default ProfitLossWidget; 