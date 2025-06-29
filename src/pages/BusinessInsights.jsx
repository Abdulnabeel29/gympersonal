import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Pie, Line } from "react-chartjs-2";
import CountUp from "react-countup";
import "./BusinessInsights.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { FaUsers, FaArrowUp, FaArrowDown, FaChartBar, FaChartPie, FaDollarSign } from 'react-icons/fa';
import api from '../service/api';
import eventBus from '../service/event-bus';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const userRole = "admin";

const BusinessInsights = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalMembers: 0, monthlyRevenue: 0, monthlyExpense: 0 });
  const [history, setHistory] = useState([]);
  const [memberDistribution, setMemberDistribution] = useState({ active: 0, expired: 0 });
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expectedProfit, setExpectedProfit] = useState(80000);
  const [expenseLimit, setExpenseLimit] = useState(100000);
  const [tempExpenseLimit, setTempExpenseLimit] = useState(100000);
  const [note, setNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [metrics, setMetrics] = useState({
    revenue: 0,
    expense: 0,
    cogs: 0,
    grossProfit: 0,
    ebitda: 0,
    netProfit: 0,
    depreciation: 0,
    interest: 0,
    tax: 0
  });
  const alertShownRef = useRef(false);

  useEffect(() => {
    if (userRole !== "admin") {
      navigate("/",{replace: true });
    }
  }, [navigate]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes, memberRes, expenseRes, metricsRes, noteRes] = await Promise.all([
        api.get('/insights/key-stats'),
        api.get('/insights/income-expense-history'),
        api.get('/insights/member-distribution'),
        api.get('/insights/expense-breakdown'),
        api.post('/insights/financial-metrics', {}),
        api.get('/insights/notes')
      ]);
      
      setStats(statsRes.data);
      setHistory(historyRes.data);
      setMemberDistribution(memberRes.data);
      setExpenseBreakdown(expenseRes.data);
      setMetrics(metricsRes.data);
      setNote(noteRes.data.note || '');

      const expenseLimitRes = await api.get('/settings/expense-limit');
      const limit = expenseLimitRes.data.limit || 100000;
      setExpenseLimit(limit);
      setTempExpenseLimit(limit);

      if (statsRes.data.monthlyExpense >= limit) {
        if (!alertShownRef.current) {
          toast.warn("You have reached your monthly expense limit!");
          alertShownRef.current = true;
        }
      } else {
        alertShownRef.current = false;
      }

    } catch (error) {
      console.error("Failed to fetch business insights:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const handleExpenseAdded = () => {
      fetchData();
    };

    eventBus.on('expense-added', handleExpenseAdded);

    return () => {
      eventBus.remove('expense-added', handleExpenseAdded);
    };
  }, [fetchData]);

  const handleSaveExpenseLimit = async () => {
    try {
      await api.post('/settings/expense-limit', { limit: tempExpenseLimit });
      setExpenseLimit(tempExpenseLimit);
    } catch (error) {
      console.error('Failed to save expense limit:', error);
    }
  };

  const handleSaveNote = async () => {
    try {
      await api.post('/insights/notes', { note });
      toast.success('Note saved!');
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note.');
    }
  };

  if (userRole !== "admin") return null;

  const profitCurveData = {
    labels: history.map(h => new Date(h.month).toLocaleString('default', { month: 'short', year: '2-digit' })),
    datasets: [
      {
        label: 'Expected Profit',
        data: history.map(() => expectedProfit),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Actual Profit',
        data: history.map(h => h.totalIncome - h.totalExpense),
        borderColor: '#28B295',
        backgroundColor: 'rgba(40, 178, 149, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const historyChartData = {
    labels: history.map(h => new Date(h.month).toLocaleString('default', { month: 'short', year: '2-digit' })),
    datasets: [
      {
        label: 'Income',
        data: history.map(h => h.totalIncome),
        backgroundColor: 'rgba(40, 178, 149, 0.7)',
        borderColor: '#28B295',
        borderWidth: 2,
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: history.map(h => h.totalExpense),
        backgroundColor: 'rgba(255, 113, 91, 0.7)',
        borderColor: '#FF715B',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const memberChartData = {
    labels: ['Active', 'Expired'],
    datasets: [{
      data: [memberDistribution.active, memberDistribution.expired],
      backgroundColor: ['#28B295', '#FF715B'],
      borderColor: ['#1C1C1E'],
      borderWidth: 2,
    }],
  };
  
  const expenseChartData = {
    labels: expenseBreakdown.map(e => e.category),
    datasets: [{
      data: expenseBreakdown.map(e => e.total),
      backgroundColor: ['#3f51b5', '#2196f3', '#4caf50', '#ff5722', '#9c27b0', '#ffc107', '#e91e63', '#795548', '#607d8b', '#00bcd4'],
      borderColor: ['#1C1C1E'],
      borderWidth: 2,
    }],
  };

  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#E3E3E0', font: { size: 14 } } },
      tooltip: {
        enabled: true,
        backgroundColor: '#2A2A2C',
        titleColor: '#D6F84C',
        bodyColor: '#E3E3E0',
        borderColor: '#D6F84C',
        borderWidth: 1,
      },
      title: { display: true, text: title, color: '#D6F84C', font: { size: 18 } },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: '#E3E3E0' }, grid: { color: 'rgba(227, 227, 224, 0.1)' } },
      x: { ticks: { color: '#E3E3E0' }, grid: { color: 'rgba(227, 227, 224, 0.1)' } },
    },
  });
  
  const pieChartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#E3E3E0', font: { size: 14 } } },
      tooltip: {
        enabled: true,
        backgroundColor: '#2A2A2C',
        titleColor: '#D6F84C',
        bodyColor: '#E3E3E0',
        borderColor: '#D6F84C',
        borderWidth: 1,
      },
      title: { display: true, text: title, color: '#D6F84C', font: { size: 18 } },
    },
    scales: {
      y: { display: false },
      x: { display: false }
    }
  });

  const tips = [
    "Offer referral discounts to gain new members.",
    "Reduce electricity usage during non-peak hours.",
    "Use social media to promote gym deals.",
    "Review underused equipment to lower costs.",
  ];

  if (loading) {
    return <div className="loading-spinner">Loading Business Insights...</div>;
  }

  return (
    <div className="insights-container">
      <div className="hero-section">
        <h1>Business Insights</h1>
        <p>An overview of your gym's performance and key metrics.</p>
      </div>

      <div>
        <div className="stats-grid">
           <div className="stat-card total-members">
            <FaUsers className="stat-icon" />
            <div className="stat-content">
              <h3><CountUp end={stats.totalMembers} duration={2} /></h3>
              <p>Total Members</p>
            </div>
          </div>
          <div className="stat-card revenue">
            <FaArrowUp className="stat-icon" />
            <div className="stat-content">
              <h3>₹<CountUp end={stats.monthlyRevenue} duration={2} separator="," /></h3>
              <p>Monthly Revenue</p>
            </div>
          </div>
          <div className="stat-card expense">
            <FaArrowDown className="stat-icon" />
            <div className="stat-content">
              <h3>₹<CountUp end={stats.monthlyExpense} duration={2} separator="," /></h3>
              <p>Monthly Expenses</p>
            </div>
          </div>
          <div className="stat-card profit">
            <FaDollarSign className="stat-icon" />
            <div className="stat-content">
              <h3>₹<CountUp end={stats.monthlyRevenue - stats.monthlyExpense} duration={2} separator="," /></h3>
              <p>Net Monthly Profit</p>
            </div>
          </div>
        </div>

        <div className="expense-limiter-card">
          <h2 className="section-title">Monthly Expense Limiter</h2>
          <div className="limiter-input">
            <label>Set Limit (₹):</label>
            <input 
              type="number" 
              value={tempExpenseLimit}
              onChange={(e) => setTempExpenseLimit(Number(e.target.value))}
            />
            <button onClick={handleSaveExpenseLimit}>Set</button>
          </div>
          <div className="progress-bar-container">
            <div 
              className="progress-bar"
              style={{ width: `${Math.min((stats.monthlyExpense / expenseLimit) * 100, 100)}%`}}
            ></div>
          </div>
          <div className="limiter-text">
            <span>₹{stats.monthlyExpense.toLocaleString()}</span> / <span>₹{expenseLimit.toLocaleString()}</span>
          </div>
        </div>

        <div className="expected-profit-input">
          <label>Expected Monthly Profit (₹):</label>
          <input
            type="number"
            value={expectedProfit}
            onChange={(e) => setExpectedProfit(Number(e.target.value))}
            placeholder="e.g., 80000"
          />
        </div>

        <div className="financial-metrics-card">
          <h2 className="section-title"><FaChartBar /> Financial Metrics (Last 30 Days)</h2>
          <div className="metrics-grid">
            <div className="metric-item"><span>Revenue:</span> <strong>₹{metrics.revenue.toLocaleString()}</strong></div>
            <div className="metric-item"><span>Total Expenses:</span> <strong>₹{metrics.expense.toLocaleString()}</strong></div>
            <div className="metric-item"><span>COGS:</span> <strong>₹{metrics.cogs.toLocaleString()}</strong></div>
            <div className="metric-item"><span>Gross Profit:</span> <strong>₹{metrics.grossProfit.toLocaleString()}</strong></div>
            <div className="metric-item"><span>EBITDA:</span> <strong>₹{metrics.ebitda.toLocaleString()}</strong></div>
            <div className="metric-item"><span>Net Profit:</span> <strong>₹{metrics.netProfit.toLocaleString()}</strong></div>
            <div className="metric-item"><span>Depreciation:</span> <strong>₹{metrics.depreciation.toLocaleString()}</strong></div>
            <div className="metric-item"><span>Interest:</span> <strong>₹{metrics.interest.toLocaleString()}</strong></div>
            <div className="metric-item"><span>Tax:</span> <strong>₹{metrics.tax.toLocaleString()}</strong></div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-container main-chart">
            <h2 className="section-title"><FaChartBar /> Monthly Income vs Expense</h2>
            <div className="chart-wrapper">
              <Bar data={historyChartData} options={chartOptions('Income vs. Expense Over Time')} />
            </div>
          </div>

          <div className="chart-container side-chart">
            <h2 className="section-title"><FaChartPie /> Member Distribution</h2>
            <div className="pie-chart-wrapper">
              <Pie data={memberChartData} options={pieChartOptions('Active vs. Expired Memberships')} />
            </div>
          </div>

          <div className="chart-container side-chart">
            <h2 className="section-title"><FaChartPie /> Expense Breakdown</h2>
            <div className="pie-chart-wrapper">
              <Pie data={expenseChartData} options={pieChartOptions('Expense Distribution by Category')} />
            </div>
          </div>

          <div className="chart-container main-chart">
            <h2 className="section-title"><FaChartBar /> Profit Curve</h2>
            <div className="chart-wrapper">
              <Line data={profitCurveData} options={chartOptions('Profit Over Time')} />
            </div>
          </div>
        </div>
        
        <div className="note-section">
          <h2 className="section-title">Business Notepad</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Jot down business ideas, leads, or reminders..."></textarea>
          <button onClick={handleSaveNote}>Save Note</button>
        </div>

        <div className="tips-section">
          <h2 className="section-title">Quick Tips for Growth</h2>
          <ul>
            {tips.map((tip, index) => <li key={index}>{tip}</li>)}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default BusinessInsights;
