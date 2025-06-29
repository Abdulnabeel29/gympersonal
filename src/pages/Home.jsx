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
        .filter(e => e.type === 'income' && new Date(e.date).getMonth() === thisMonth && new Date(e.date).getFullYear() === thisYear)
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
      <div className="home-header" style={{ background: 'linear-gradient(135deg, #23272f 0%, #23272f 100%)', border: 'none', boxShadow: 'none', marginBottom: '2.5rem' }}>
        <div className="header-content">
          <div>
            <h1 style={{ color: '#28B295', fontSize: '2.5rem', marginBottom: 0 }}>Dashboard</h1>
            <p style={{ color: '#b0b3b8', fontWeight: 500, marginBottom: 8 }}>
              Welcome back! Your gym's mission control. Customize your view below.
            </p>
          </div>
          <div className="contact-info-header" style={{ display: 'flex', gap: 12 }}>
            <a
              href="mailto:Solsparrowhq@gmail.com"
              className="contact-link-header"
              title="Email"
              style={{ background: '#23272f', border: '1px solid #28B295', color: '#28B295' }}
            >
              <FaEnvelope />
            </a>
            <a
              href="https://www.instagram.com/solsparrow.co?igsh=OTR4cjNld3Zvdms4"
              className="contact-link-header"
              title="Instagram"
              target="_blank"
              rel="noopener noreferrer"
              style={{ background: '#23272f', border: '1px solid #28B295', color: '#28B295', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div
        className="summary-cards"
        style={{
          display: 'flex',
          gap: '2rem',
          margin: '0 0 2.5rem 0',
          justifyContent: 'space-between',
        }}
      >
        {summaryCards.map(card => (
          <div
            className={`stat-card-dash ${card.color}`}
            key={card.key}
            onClick={card.onClick}
            style={{
              flex: '1 1 0',
              background: '#23272f',
              border: 'none',
              boxShadow: '0 2px 12px #0004',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              padding: '0.7rem 0.5rem',
              minWidth: 0,
              transition: 'box-shadow 0.2s, background 0.2s, color 0.2s',
              minHeight: 80,
              maxHeight: 90,
              cursor: 'pointer',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = '#28B295';
              e.currentTarget.style.color = '#23272f';
              e.currentTarget.style.boxShadow = '0 4px 18px #28b29533';
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#23272f';
              e.currentTarget.style.color = '';
              e.currentTarget.style.boxShadow = '0 2px 12px #0004';
            }}
          >
            <div
              className="icon"
              style={{
                background: '#28B295',
                color: '#fff',
                fontSize: '1.05rem',
                borderRadius: '50%',
                padding: '0.45rem',
                marginRight: '0.5rem',
                minWidth: '1.7rem',
                minHeight: '1.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {card.icon}
            </div>
            <div className="stat-info" style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                color: '#b0b3b8',
                fontWeight: 600,
                marginBottom: 1,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{card.label}</p>
              <span style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: 1,
                display: 'block'
              }}>
                {card.prefix || ''}
                {loading ? <span style={{ color: '#28B295' }}>...</span> : <CountUp end={stats[card.key] || 0} duration={1.2} separator="," />}
              </span>
              <div style={{
                fontSize: '0.75rem',
                color: card.subColor,
                fontWeight: 500,
                marginTop: 1,
                opacity: 0.8,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        className="quick-actions-container"
        style={{
          background: '#23272f',
          borderRadius: 18,
          boxShadow: '0 2px 16px #0003',
          padding: '2rem 2.5rem',
          marginBottom: '2.5rem',
          maxWidth: 1100,
          marginLeft: 'auto',
          marginRight: 'auto',
          border: '1.5px solid #282c34',
        }}
      >
        <div
          className="quick-actions-title"
          style={{
            color: '#28B295',
            fontWeight: 700,
            fontSize: '1.18rem',
            marginBottom: '1.2rem',
            letterSpacing: 1,
          }}
        >
          Quick Actions
        </div>
        <div
          className="quick-actions"
          style={{
            display: 'flex',
            gap: '2rem',
            justifyContent: 'center',
            alignItems: 'stretch',
            flexWrap: 'wrap',
          }}
        >
          {quickActions.map(action => (
            <button
              key={action.label}
              className="quick-link-btn"
              style={{
                flex: '1 1 180px',
                minWidth: 180,
                minHeight: 110,
                fontSize: '1.13rem',
                background: '#23272f',
                color: '#28B295',
                border: '1.5px solid #2c2f36',
                borderRadius: '14px',
                boxShadow: '0 2px 12px #0002',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                transition: 'all 0.18s',
                cursor: 'pointer',
                outline: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => navigate(action.path)}
              onMouseOver={e => {
                e.currentTarget.style.background = '#28B295';
                e.currentTarget.style.color = '#23272f';
                e.currentTarget.style.border = '1.5px solid #28B295';
                e.currentTarget.style.boxShadow = '0 4px 18px #28b29533';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#23272f';
                e.currentTarget.style.color = '#28B295';
                e.currentTarget.style.border = '1.5px solid #2c2f36';
                e.currentTarget.style.boxShadow = '0 2px 12px #0002';
              }}
            >
              <span style={{ fontSize: '2.2rem', marginBottom: 8 }}>{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Widgets Row */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        {/* Schedule */}
        <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column' }}>
          <div className="widget"
            style={{
              minHeight: 320,
              height: '100%',
              background: '#23272f',
              border: 'none',
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}>
            <div className="widget-header" style={{ background: 'none', borderBottom: 'none', padding: '1.2rem 1.5rem' }}>
              <div className="widget-title">
                <h3 style={{ color: '#28B295', fontWeight: 700, fontSize: '1.15rem', margin: 0 }}>Today's Schedule</h3>
              </div>
            </div>
            <div className="widget-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="schedule-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {schedule.length > 0 ? (
                  schedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="schedule-item"
                      style={{
                        background: 'linear-gradient(90deg, #23272f 80%, #28B29511 100%)',
                        border: '1px solid #28B295',
                        borderRadius: 10,
                        marginBottom: 0,
                        padding: '0.8rem 1.1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 2px 8px #0002',
                        transition: 'box-shadow 0.18s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ color: '#28B295', fontWeight: 700, fontSize: '1.02rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FaCalendarAlt style={{ marginRight: 6, fontSize: '1.1rem' }} />
                          {formatTime(item.start_time)} - {formatTime(item.end_time)}
                        </span>
                        <span style={{ marginLeft: 'auto', color: '#28B295', fontWeight: 600, fontSize: '0.95rem', background: '#23272f', borderRadius: 6, padding: '2px 10px', border: '1px solid #28B295', opacity: 0.9 }}>
                          {item.slots}
                        </span>
                      </div>
                      <div className="schedule-details" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span className="class-name" style={{ color: '#fff', fontWeight: 600, fontSize: '1.01rem', marginBottom: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.class_name}</span>
                        <span className="instructor" style={{ color: '#b0b3b8', fontWeight: 500, fontSize: '0.93rem', opacity: 0.85, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.instructor}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-message" style={{ color: '#b0b3b8', textAlign: 'center', marginTop: 30 }}>No classes scheduled for today.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column' }}>
          <div className="widget"
            style={{
              minHeight: 320,
              height: '100%',
              background: '#23272f',
              border: 'none',
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}>
            <div className="widget-header" style={{ background: 'none', borderBottom: 'none', padding: '1.2rem 1.5rem' }}>
              <div className="widget-title">
                <h3 style={{ color: '#28B295', fontWeight: 700, fontSize: '1.15rem', margin: 0 }}>Alerts & Notifications</h3>
              </div>
            </div>
            <div className="widget-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.map((alert, idx) => (
                <div
                  key={idx}
                  onClick={() => handleAlertClick(alert)}
                  style={{
                    background: alert.type === 'danger'
                      ? 'rgba(255,113,91,0.12)'
                      : alert.type === 'warning'
                        ? 'rgba(40,178,149,0.10)'
                        : 'rgba(40,178,149,0.18)',
                    color: alert.type === 'danger' ? '#FF715B' : '#28B295',
                    borderRadius: 10,
                    padding: '0.85rem 1rem',
                    marginBottom: 0,
                    border: `1.5px solid ${alert.type === 'danger' ? '#FF715B' : '#28B295'}`,
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxShadow: alert.type === 'danger'
                      ? '0 2px 8px #ff715b22'
                      : alert.type === 'warning'
                        ? '0 2px 8px #28b29522'
                        : '0 2px 8px #28b29533',
                    transition: 'box-shadow 0.18s, background 0.18s',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = alert.type === 'danger'
                      ? 'rgba(255,113,91,0.18)'
                      : 'rgba(40,178,149,0.18)';
                    e.currentTarget.style.boxShadow = '0 4px 18px #28b29533';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = alert.type === 'danger'
                      ? 'rgba(255,113,91,0.12)'
                      : alert.type === 'warning'
                        ? 'rgba(40,178,149,0.10)'
                        : 'rgba(40,178,149,0.18)';
                    e.currentTarget.style.boxShadow = alert.type === 'danger'
                      ? '0 2px 8px #ff715b22'
                      : alert.type === 'warning'
                        ? '0 2px 8px #28b29522'
                        : '0 2px 8px #28b29533';
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', marginBottom: 2 }}>{alert.title}</div>
                  <div style={{ fontSize: '0.93rem', marginBottom: 2, color: '#b0b3b8' }}>{alert.message}</div>
                  <div style={{ fontSize: '0.81rem', opacity: 0.8 }}>Source: {alert.source}</div>
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