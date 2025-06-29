import React, { useState, useEffect, useCallback } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { FaUsers, FaDollarSign, FaUserPlus, FaPlusCircle, FaCalendarAlt, FaClock, FaBoxOpen, FaClipboardList, FaInstagram, FaEnvelope } from 'react-icons/fa';
import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';
import './Home.css';
import MemberTable from '../assets/components/MemberTable';
import FinancesWidget from '../assets/components/widgets/FinancesWidget';
import StaffWidget from '../assets/components/widgets/StaffWidget';
import EnquiriesWidget from '../assets/components/widgets/EnquiriesWidget';
import ExpiringMembersWidget from '../assets/components/widgets/ExpiringMembersWidget';
import AlertsWidget from '../assets/components/widgets/AlertsWidget';
import NotesWidget from '../assets/components/widgets/NotesWidget';
import ProfitLossWidget from '../assets/components/widgets/ProfitLossWidget';
import ContactWidget from '../assets/components/widgets/ContactWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

// --- Widget Components (Stateless Wrappers or Direct Components) ---

const StatsWidget = ({ stats }) => {
  console.log('StatsWidget received stats:', stats); // Debug log
  return (
    <div className="stats-cards-grid">
      <div className="stat-card-dash users">
        <FaUsers className="icon users" />
        <div className="stat-info">
          <p>Total Members</p>
          <span><CountUp end={stats.totalMembers || 0} duration={2} /></span>
        </div>
      </div>
      <div className="stat-card-dash revenue">
        <FaDollarSign className="icon revenue" />
        <div className="stat-info">
          <p>30-Day Revenue</p>
          <span>₹<CountUp end={stats.monthlyRevenue || 0} duration={2.5} separator="," /></span>
        </div>
      </div>
    </div>
  );
};

const QuickLinksWidget = () => {
  const navigate = useNavigate();
  const links = [
    { name: 'Add Member', icon: <FaUserPlus />, path: '/members' },
    { name: 'Add Finance', icon: <FaPlusCircle />, path: '/finances/add' },
    { name: 'Full Schedule', icon: <FaCalendarAlt />, path: '/schedule' },
    { name: 'Inventory', icon: <FaBoxOpen />, path: '/inventory' },
    { name: 'Enquiries', icon: <FaClipboardList />, path: '/enquiries' },
  ];
  return (
    <div className="widget-content">
      <div className="quick-links-grid">
        {links.map(link => (
          <button key={link.name} onClick={() => navigate(link.path)} className="quick-link-btn">
            {link.icon}
            <span>{link.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const ScheduleWidget = ({ schedule }) => {
    const formatTime = (timeString) => new Date(timeString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return (
      <div className="widget-content">
        <div className="schedule-list">
          {schedule.length > 0 ? (
            schedule.map((item, index) => (
              <div key={index} className="schedule-item">
                <div className="schedule-time">
                  <FaClock /> {formatTime(item.start_time)} - {formatTime(item.end_time)}
                </div>
                <div className="schedule-details">
                  <p className="class-name">{item.class_name}</p>
                  <p className="instructor">{item.instructor}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-message">No classes scheduled for today.</div>
          )}
        </div>
      </div>
    );
  };
  
  const RecentMembersWidget = ({ recentMembers }) => {
    console.log('RecentMembersWidget received:', recentMembers); // Debug log
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (!recentMembers || recentMembers.length === 0) {
      return (
        <div className="widget-content">
          <div className="empty-message">No recent members to display.</div>
        </div>
      );
    }

    return (
      <div className="widget-content">
        <div className="members-list">
          {recentMembers.map((member, index) => (
            <div key={index} className="member-item">
              <p className="member-name">{member.name}</p>
              <p className="join-date">Joined: {formatDate(member.join_date)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

// --- Main Dashboard Component ---

const Home = () => {
  const [stats, setStats] = useState({ totalMembers: 0, monthlyRevenue: 0 });
  const [schedule, setSchedule] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [layouts, setLayouts] = useState({ lg: [] });
  const [widgets, setWidgets] = useState([]);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Create widget components with current data - memoized to prevent unnecessary re-renders
  const availableWidgets = React.useMemo(() => [
    { id: 'stats', name: 'Key Stats', component: <StatsWidget stats={stats} />, defaultLayout: { w: 2, h: 1, x: 0, y: 0, minW: 2, minH: 1 } },
    { id: 'quickLinks', name: 'Quick Links', component: <QuickLinksWidget />, defaultLayout: { w: 2, h: 1, x: 0, y: 1, minW: 2, minH: 1 } },
    { id: 'alerts', name: 'Alerts', component: <AlertsWidget />, defaultLayout: { w: 1, h: 2, x: 0, y: 2, minW: 1, minH: 2 } },
    { id: 'profitLoss', name: 'Profit & Loss (6 Months)', component: <ProfitLossWidget />, defaultLayout: { w: 1, h: 2, x: 1, y: 2, minW: 1, minH: 2 } },
    { id: 'schedule', name: "Today's Schedule", component: <ScheduleWidget schedule={schedule} />, defaultLayout: { w: 1, h: 2, x: 0, y: 4, minW: 1, minH: 2 } },
    { id: 'recentMembers', name: 'Recent Members', component: <RecentMembersWidget recentMembers={recentMembers} />, defaultLayout: { w: 1, h: 2, x: 1, y: 4, minW: 1, minH: 2 } },
    { id: 'expiringMembers', name: 'Members Expiring Soon', component: <ExpiringMembersWidget />, defaultLayout: { w: 1, h: 2, x: 0, y: 6, minW: 1, minH: 2 } },
    { id: 'finances', name: 'Recent Finances', component: <FinancesWidget />, defaultLayout: { w: 1, h: 2, x: 1, y: 6, minW: 1, minH: 2 } },
    { id: 'staff', name: 'Staff Overview', component: <StaffWidget />, defaultLayout: { w: 1, h: 2, x: 0, y: 8, minW: 1, minH: 2 } },
    { id: 'notes', name: 'Notes', component: <NotesWidget />, defaultLayout: { w: 1, h: 2, x: 1, y: 8, minW: 1, minH: 2 } },
    { id: 'enquiries', name: 'Recent Enquiries', component: <EnquiriesWidget />, defaultLayout: { w: 1, h: 2, x: 0, y: 10, minW: 1, minH: 2 } },
    { id: 'contact', name: 'Contact', component: <ContactWidget />, defaultLayout: { w: 1, h: 2, x: 0, y: 12, minW: 1, minH: 2 } },
  ], [stats, schedule, recentMembers]);
  
  const fetchDashboardData = useCallback(async () => {
    if (isInitialized) return; // Prevent multiple fetches
    
    try {
      console.log('Fetching dashboard data...'); // Debug log
      const [statsRes, scheduleRes, membersRes, layoutRes] = await Promise.all([
        api.get('/insights/key-stats'),
        api.get('/insights/todays-schedule'),
        api.get('/insights/recent-members'),
        api.get('/settings/dashboard-layout'),
      ]);
      
      console.log('Stats response:', statsRes.data); // Debug log
      console.log('Schedule response:', scheduleRes.data); // Debug log
      console.log('Members response:', membersRes.data); // Debug log
      
      setStats(statsRes.data);
      setSchedule(scheduleRes.data);
      setRecentMembers(membersRes.data);
      setBackendAvailable(true);
      
      let savedLayouts;
      try {
        savedLayouts = layoutRes.data && typeof layoutRes.data === 'string' ? JSON.parse(layoutRes.data) : layoutRes.data;
        if (typeof savedLayouts !== 'object' || savedLayouts === null) {
          savedLayouts = { lg: [] };
        }
      } catch(e) {
        console.error("Error parsing layout JSON:", e);
        savedLayouts = { lg: [] };
      }

      if (savedLayouts && savedLayouts.lg && savedLayouts.lg.length > 0) {
        setLayouts(savedLayouts);
        const activeWidgets = savedLayouts.lg
          .map(layoutItem => availableWidgets.find(w => w.id === layoutItem.i))
          .filter(Boolean);
        setWidgets(activeWidgets);
      } else {
        const defaultWidgets = availableWidgets.filter(w => ['stats', 'quickLinks', 'alerts', 'profitLoss', 'schedule', 'recentMembers', 'enquiries', 'contact'].includes(w.id));
        setWidgets(defaultWidgets);
        const defaultLayouts = { lg: defaultWidgets.map(w => ({ ...w.defaultLayout, i: w.id })) };
        setLayouts(defaultLayouts);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setBackendAvailable(false);
      
      // Fallback mock data when backend is not available
      const mockStats = { totalMembers: 25, monthlyRevenue: 45000, monthlyExpense: 32000 };
      const mockSchedule = [
        { class_name: 'Yoga', start_time: '09:00:00', instructor: 'Sarah', member_name: 'John' },
        { class_name: 'Cardio', start_time: '10:30:00', instructor: 'Mike', member_name: 'Emma' }
      ];
      const mockMembers = [
        { name: 'John Doe', join_date: '2025-06-15' },
        { name: 'Jane Smith', join_date: '2025-06-10' },
        { name: 'Bob Johnson', join_date: '2025-06-05' }
      ];
      
      setStats(mockStats);
      setSchedule(mockSchedule);
      setRecentMembers(mockMembers);
      
      const defaultWidgets = availableWidgets.filter(w => ['stats', 'quickLinks', 'alerts', 'profitLoss', 'schedule', 'recentMembers', 'enquiries', 'contact'].includes(w.id));
      setWidgets(defaultWidgets);
      const defaultLayouts = { lg: defaultWidgets.map(w => ({ ...w.defaultLayout, i: w.id })) };
      setLayouts(defaultLayouts);
      setIsInitialized(true);
    }
  }, [availableWidgets, isInitialized]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Update widget components when data changes
  useEffect(() => {
    if (isInitialized && widgets.length > 0) {
      const updatedWidgets = widgets.map(widget => {
        const updatedWidget = availableWidgets.find(w => w.id === widget.id);
        return updatedWidget || widget;
      });
      setWidgets(updatedWidgets);
    }
  }, [availableWidgets, isInitialized, widgets.length]);

  const onLayoutChange = useCallback(async (layout, allLayouts) => {
    if (!allLayouts.lg || allLayouts.lg.length === 0) return;
    
    // Quick check to prevent saving identical layouts
    if(JSON.stringify(allLayouts) === JSON.stringify(layouts)) return;

    setLayouts(allLayouts);
    try {
      await api.post('/settings/dashboard-layout', { layout: allLayouts });
    } catch (error) {
      console.error("Failed to save layout:", error);
    }
  },[layouts]);

  const addWidget = useCallback((widgetId) => {
    const widgetToAdd = availableWidgets.find(w => w.id === widgetId);
    if (widgetToAdd && !widgets.find(w => w.id === widgetId)) {
      const newWidgets = [...widgets, widgetToAdd];
      setWidgets(newWidgets);
      
      const newLayoutItem = { ...widgetToAdd.defaultLayout, i: widgetId, x: (widgets.length * 2) % (layouts.lg ? layouts.lg.length : 2) , y: Infinity }; // place at bottom
      const newLayouts = { lg: [...layouts.lg, newLayoutItem] };
      setLayouts(newLayouts);
      onLayoutChange(newLayouts.lg, newLayouts);
    }
  }, [availableWidgets, widgets, layouts, onLayoutChange]);

  const removeWidget = useCallback((widgetId) => {
    console.log('Removing widget:', widgetId); // Debug log
    setWidgets(prevWidgets => {
      const newWidgets = prevWidgets.filter(w => w.id !== widgetId);
      console.log('New widgets:', newWidgets.map(w => w.id)); // Debug log
      return newWidgets;
    });
    setLayouts(prevLayouts => {
      const newLayouts = { lg: prevLayouts.lg.filter(l => l.i !== widgetId) };
      console.log('New layouts:', newLayouts.lg.map(l => l.i)); // Debug log
      onLayoutChange(newLayouts.lg, newLayouts);
      return newLayouts;
    });
  }, [onLayoutChange]);

  return (
    <div className="home-container">
      {!backendAvailable && (
        <div className="backend-warning">
          <p>⚠️ Backend server is not available. Showing mock data for demonstration.</p>
          <p>To see real data, please start the backend server.</p>
        </div>
      )}
      
      <div className="home-header">
        <div className="header-content">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back! Your gym's mission control. Customize your view below.</p>
          </div>
          <div className="contact-info-header">
            <a 
              href="https://www.instagram.com/solsparrow.co?igsh=OTR4cjNld3Zvdms4" 
              target="_blank" 
              rel="noopener noreferrer"
              className="contact-link-header"
              title="Instagram"
            >
              <FaInstagram />
            </a>
            <a 
              href="mailto:Solsparrowhq@gmail.com" 
              className="contact-link-header"
              title="Email"
            >
              <FaEnvelope />
            </a>
          </div>
        </div>
      </div>
      
      {!isInitialized ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="widget-controls">
            <p>Add a widget:</p>
            {availableWidgets.map(w => (
              !widgets.find(active => active.id === w.id) &&
              <button key={w.id} onClick={() => addWidget(w.id)}>{w.name}</button>
            ))}
          </div>

          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={onLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 2, md: 2, sm: 1, xs: 1, xxs: 1 }}
            rowHeight={200}
            draggableHandle=".widget-title"
            key={JSON.stringify(layouts)}
          >
            {widgets.map(widget => (
              <div key={widget.id} className="widget">
                <div className="widget-header">
                  <div className="widget-title">
                    <h3>{widget.name}</h3>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Remove button clicked for:', widget.id);
                      removeWidget(widget.id);
                    }} 
                    className="remove-widget-btn"
                    type="button"
                    title="Remove widget"
                  >
                    &times;
                  </button>
                </div>
                {widget.component}
              </div>
            ))}
          </ResponsiveGridLayout>
        </>
      )}
    </div>
  );
};

export default Home;
