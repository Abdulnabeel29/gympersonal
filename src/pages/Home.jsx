import React, { useEffect, useState } from 'react';
import { FaUsers, FaDollarSign, FaUserTie, FaCalendarAlt, FaBoxOpen, FaClipboardList, FaEnvelope, FaPlusCircle } from 'react-icons/fa';
import { FaInstagram } from 'react-icons/fa6';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const quickActions = [
  { label: 'Add Member', icon: <FaUsers />, path: '/members' },
  { label: 'Add Finance', icon: <FaPlusCircle />, path: '/finances/add' },
  { label: 'Full Schedule', icon: <FaCalendarAlt />, path: '/schedule' },
  { label: 'Inventory', icon: <FaBoxOpen />, path: '/inventory' },
  { label: 'Enquiries', icon: <FaClipboardList />, path: '/enquiries' },
];

const mockAlerts = [
  {
    type: 'danger',
    title: 'Low Stock Alert',
    message: 'Protein powder running low (5 units left)',
    source: 'Inventory Management System',
  },
  {
    type: 'warning',
    title: 'Membership Expiring',
    message: '3 members expiring in next 7 days',
    source: 'Member Management System',
  },
  {
    type: 'success',
    title: 'Revenue Milestone',
    message: 'You crossed ₹40,000 this month!',
    source: 'Finance System',
  },
];

function formatTime(timeString) {
  const date = new Date(timeString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const Home = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    prevMonthMembers: 0,
    monthlyRevenue: 0,
    prevMonthRevenue: 0,
    activeStaff: 0,
    todaysClasses: 0,
    prevMonthClasses: 0,
    membersIncrease: 0,
    revenueIncrease: 0,
    classesIncrease: 0,
  });
  const [schedule, setSchedule] = useState([]);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load all dashboard data in parallel for faster loading
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardStats(), fetchTodaySchedule()]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Fetch dashboard stats from APIs
  const fetchDashboardStats = async () => {
    try {
      // Dates
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

      // Parallel API requests for better speed
      const [membersRes, staffRes, financeRes] = await Promise.all([
        axios.get('https://solsparrow-backend.onrender.com/api/members'),
        axios.get('https://solsparrow-backend.onrender.com/api/staff'),
        axios.get('https://solsparrow-backend.onrender.com/api/finances'),
      ]);

      // Members
      const members = membersRes.data;
      const totalMembers = members.length;
      const lastMonthEnd = new Date(thisYear, thisMonth, 0, 23, 59, 59, 999);
      const prevMonthMembers = members.filter(m => {
        const joined = new Date(m.join_date || m.createdAt || m.date);
        return joined <= lastMonthEnd;
      }).length;

      // Staff
      const activeStaff = staffRes.data.filter(s => s.status === 'Active').length;

      // Finances (Monthly Revenue)
      const monthlyRevenue = financeRes.data
        .filter(e => e.type === 'income' && new Date(e.date).getMonth() === thisMonth && new(e.date).getFullYear() === thisYear)
        .reduce((sum, e) => sum + Number(e.amount), 0);
      const prevMonthRevenue = financeRes.data
        .filter(e => e.type === 'income' && new Date(e.date).getMonth() === lastMonth && new Date(e.date).getFullYear() === lastMonthYear)
        .reduce((sum, e) => sum + Number(e.amount), 0);

      // Classes (mock)
      const today = new Date().toISOString().slice(0, 10);
      const mockSchedule = [
        { class_name: 'Morning Yoga', instructor: 'Sarah Johnson', start_time: `${today}T06:00:00`, end_time: `${today}T07:00:00`, slots: '12/15' },
        { class_name: 'HIIT Training', instructor: 'Mike Wilson', start_time: `${today}T08:00:00`, end_time: `${today}T09:00:00`, slots: '8/10' },
        { class_name: 'Zumba Dance', instructor: 'Lisa Garcia', start_time: `${today}T10:00:00`, end_time: `${today}T11:00:00`, slots: '20/25' },
      ];
      const todaysClasses = mockSchedule.length;
      const prevMonthClasses = 2;

      // Calculate percentage increases
      const membersIncrease = prevMonthMembers === 0
        ? (totalMembers > 0 ? 100 : 0)
        : Math.round(((totalMembers - prevMonthMembers) / prevMonthMembers) * 100);

      const revenueIncrease = prevMonthRevenue === 0
        ? (monthlyRevenue > 0 ? 100 : 0)
        : Math.round(((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100);

      const classesIncrease = prevMonthClasses === 0
        ? (todaysClasses > 0 ? 100 : 0)
        : Math.round(((todaysClasses - prevMonthClasses) / prevMonthClasses) * 100);

      setStats(prev => ({
        ...prev,
        totalMembers,
        prevMonthMembers,
        monthlyRevenue,
        prevMonthRevenue,
        activeStaff,
        todaysClasses,
        prevMonthClasses,
        membersIncrease,
        revenueIncrease,
        classesIncrease,
      }));
    } catch (err) {
      setStats(prev => ({
        ...prev,
        totalMembers: 0,
        prevMonthMembers: 0,
        monthlyRevenue: 0,
        prevMonthRevenue: 0,
        activeStaff: 0,
        todaysClasses: 0,
        prevMonthClasses: 0,
        membersIncrease: 0,
        revenueIncrease: 0,
        classesIncrease: 0,
      }));
    }
  };

  // Fetch today's classes (for schedule widget)
  const fetchTodaySchedule = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const mockSchedule = [
        { class_name: 'Morning Yoga', instructor: 'Sarah Johnson', start_time: `${today}T06:00:00`, end_time: `${today}T07:00:00`, slots: '12/15' },
        { class_name: 'HIIT Training', instructor: 'Mike Wilson', start_time: `${today}T08:00:00`, end_time: `${today}T09:00:00`, slots: '8/10' },
        { class_name: 'Zumba Dance', instructor: 'Lisa Garcia', start_time: `${today}T10:00:00`, end_time: `${today}T11:00:00`, slots: '20/25' },
      ];
      setSchedule(mockSchedule);
    } catch (err) {
      setSchedule([]);
    }
  };

  // Summary cards config with dynamic sub fields
  const summaryCards = [
    {
      label: 'Total Members',
      icon: <FaUsers />,
      key: 'totalMembers',
      color: 'users',
      sub: `${stats.membersIncrease >= 0 ? '+' : ''}${stats.membersIncrease}% from last month`,
      subColor: '#28B295',
      onClick: () => navigate('/members'),
    },
    {
      label: 'Monthly Revenue',
      icon: <FaDollarSign />,
      key: 'monthlyRevenue',
      color: 'revenue',
      sub: `${stats.revenueIncrease >= 0 ? '+' : ''}${stats.revenueIncrease}% from last month`,
      subColor: '#28B295',
      prefix: '₹',
      onClick: () => navigate('/finances/view'),
    },
    {
      label: 'Active Staff',
      icon: <FaUserTie />,
      key: 'activeStaff',
      color: 'staff',
      sub: '2 new this week',
      subColor: '#28B295',
      onClick: () => navigate('/staff'),
    },
    {
      label: "Today's Classes",
      icon: <FaCalendarAlt />,
      key: 'todaysClasses',
      color: 'classes',
      sub: `${stats.classesIncrease >= 0 ? '+' : ''}${stats.classesIncrease}% from last month`,
      subColor: '#28B295',
      onClick: () => navigate('/schedule'),
    },
  ];

  // Alerts box click handlers
  const handleAlertClick = (alert) => {
    if (alert.type === 'danger') {
      navigate('/inventory');
    } else if (alert.type === 'warning') {
      navigate('/members');
    } else if (alert.type === 'success') {
      navigate('/finances/view');
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back! Your gym's mission control. Customize your view below.
            </p>
          </div>
          <div className="contact-info-header">
            <a
              href="mailto:Solsparrowhq@gmail.com"
              className="contact-link-header"
              title="Email"
            >
              <FaEnvelope />
            </a>
            <a
              href="https://www.instagram.com/solsparrow.co?igsh=OTR4cjNld3Zvdms4"
              className="contact-link-header"
              title="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        {summaryCards.map(card => (
          <div
            className={`stat-card-dash ${card.color}`}
            key={card.key}
            onClick={card.onClick}
          >
            <div className="stat-card-icon">
              {card.icon}
            </div>
            <div className="stat-info">
              <p className="stat-label">{card.label}</p>
              <span className="stat-value">
                {card.prefix || ''}
                {loading ? <span className="loading-text">...</span> : <CountUp end={stats[card.key] || 0} duration={1.2} separator="," />}
              </span>
              <div className="stat-sub" style={{ color: card.subColor }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-container">
        <div className="quick-actions-title">
          Quick Actions
        </div>
        <div className="quick-actions">
          {quickActions.map(action => (
            <button
              key={action.label}
              className="quick-link-btn"
              onClick={() => navigate(action.path)}
            >
              <span className="quick-action-icon">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Widgets Row */}
      <div className="widgets-row">
        {/* Schedule */}
        <div className="widget-container">
          <div className="widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Today's Schedule</h3>
              </div>
            </div>
            <div className="widget-content">
              <div className="schedule-list">
                {schedule.length > 0 ? (
                  schedule.map((item, idx) => (
                    <div key={idx} className="schedule-item">
                      <div className="schedule-item-header">
                        <span className="schedule-time">
                          <FaCalendarAlt className="schedule-icon" />
                          {formatTime(item.start_time)} - {formatTime(item.end_time)}
                        </span>
                        <span className="schedule-slots">
                          {item.slots}
                        </span>
                      </div>
                      <div className="schedule-details">
                        <span className="class-name">{item.class_name}</span>
                        <span className="instructor">
                          {item.instructor}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-message">No classes scheduled for today.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="widget-container">
          <div className="widget">
            <div className="widget-header">
              <div className="widget-title">
                <h3>Alerts & Notifications</h3>
              </div>
            </div>
            <div className="widget-content alerts-content">
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`alert-item alert-${alert.type}`}
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-message">{alert.message}</div>
                  <div className="alert-source">Source: {alert.source}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;