import React, { useState } from 'react';
import { FaUsers, FaDollarSign, FaCalendarAlt, FaCog, FaChartLine, FaQuestionCircle, FaLightbulb, FaExclamationTriangle, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import './Help.css';

const Help = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <FaQuestionCircle />,
      content: (
        <div className="help-content">
          <h3>Welcome to Gym Management Software!</h3>
          <p>This comprehensive system helps you manage your gym operations efficiently. Here's how to get started:</p>
          
          <div className="help-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Dashboard Overview</h4>
              <p>Start with the dashboard to get an overview of your gym's key metrics:</p>
              <ul>
                <li><strong>Key Stats:</strong> View total members and monthly revenue</li>
                <li><strong>Recent Members:</strong> See latest member registrations</li>
                <li><strong>Today's Schedule:</strong> Check upcoming classes</li>
                <li><strong>Quick Links:</strong> Access main features quickly</li>
              </ul>
            </div>
          </div>

          <div className="help-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Widget Management</h4>
              <p>Customize your dashboard by managing widgets:</p>
              <ul>
                <li><strong>Drag & Drop:</strong> Click and drag widget headers to rearrange</li>
                <li><strong>Remove Widgets:</strong> Click the × button to remove unwanted widgets</li>
                <li><strong>Add Widgets:</strong> Use the widget selector to add new widgets</li>
              </ul>
            </div>
          </div>

          <div className="help-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Navigation</h4>
              <p>Use the sidebar to navigate between different sections:</p>
              <ul>
                <li><strong>Home:</strong> Return to dashboard</li>
                <li><strong>Members:</strong> Manage member information</li>
                <li><strong>Finances:</strong> Track income and expenses</li>
                <li><strong>Schedule:</strong> Manage classes and appointments</li>
                <li><strong>Staff:</strong> Manage staff information</li>
                <li><strong>Settings:</strong> Configure system preferences</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'members',
      title: 'Managing Members',
      icon: <FaUsers />,
      content: (
        <div className="help-content">
          <h3>Member Management Guide</h3>
          <p>Efficiently manage your gym members with these features:</p>

          <div className="feature-card">
            <h4><FaUsers /> Adding New Members</h4>
            <ol>
              <li>Navigate to <strong>Members</strong> in the sidebar</li>
              <li>Click the <strong>"Add New Member"</strong> button</li>
              <li>Fill in the required information:
                <ul>
                  <li>Personal details (name, email, phone)</li>
                  <li>Membership type and duration</li>
                  <li>Emergency contact information</li>
                  <li>Body measurements (optional)</li>
                </ul>
              </li>
              <li>Click <strong>"Save Member"</strong> to complete registration</li>
            </ol>
          </div>

          <div className="feature-card">
            <h4><FaCheckCircle /> Member Search & Filter</h4>
            <ul>
              <li><strong>Search:</strong> Use the search bar to find members by name or email</li>
              <li><strong>Filter:</strong> Filter by membership status, type, or join date</li>
              <li><strong>Sort:</strong> Click column headers to sort the member list</li>
            </ul>
          </div>

          <div className="feature-card">
            <h4><FaExclamationTriangle /> Managing Memberships</h4>
            <ul>
              <li><strong>Edit:</strong> Click the edit icon to modify member information</li>
              <li><strong>Renew:</strong> Extend membership periods before expiration</li>
              <li><strong>Suspend:</strong> Temporarily suspend memberships if needed</li>
              <li><strong>Delete:</strong> Remove members (use with caution)</li>
            </ul>
          </div>

          <div className="tip-box">
            <FaLightbulb />
            <div>
              <h4>Pro Tip</h4>
              <p>Regularly check the "Expiring Members" widget on your dashboard to proactively reach out to members whose memberships are about to expire.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'finances',
      title: 'Financial Management',
      icon: <FaDollarSign />,
      content: (
        <div className="help-content">
          <h3>Financial Management Guide</h3>
          <p>Track your gym's financial health with comprehensive tools:</p>

          <div className="feature-card">
            <h4><FaDollarSign /> Adding Financial Records</h4>
            <ol>
              <li>Go to <strong>Finances</strong> → <strong>Add Finance</strong></li>
              <li>Select the transaction type:
                <ul>
                  <li><strong>Income:</strong> Membership fees, personal training, etc.</li>
                  <li><strong>Expense:</strong> Rent, utilities, equipment, staff salaries</li>
                </ul>
              </li>
              <li>Enter amount, date, and description</li>
              <li>Choose appropriate category</li>
              <li>Click <strong>"Save"</strong> to record the transaction</li>
            </ol>
          </div>

          <div className="feature-card">
            <h4><FaCalendarAlt /> Recurring Transactions</h4>
            <p>Set up automatic recurring transactions for regular income or expenses:</p>
            <ul>
              <li><strong>Monthly Memberships:</strong> Automatically record monthly fees</li>
              <li><strong>Rent Payments:</strong> Track regular facility expenses</li>
              <li><strong>Staff Salaries:</strong> Manage regular payroll expenses</li>
              <li><strong>Utility Bills:</strong> Track recurring operational costs</li>
            </ul>
          </div>

          <div className="feature-card">
            <h4><FaChartLine /> Financial Reports</h4>
            <ul>
              <li><strong>Income vs Expenses:</strong> Compare monthly revenue and costs</li>
              <li><strong>Category Breakdown:</strong> See spending patterns by category</li>
              <li><strong>Profit/Loss:</strong> Track overall financial performance</li>
              <li><strong>Trends:</strong> Monitor financial growth over time</li>
            </ul>
          </div>

          <div className="tip-box">
            <FaLightbulb />
            <div>
              <h4>Financial Best Practices</h4>
              <ul>
                <li>Record transactions daily to maintain accurate records</li>
                <li>Use specific categories for better expense tracking</li>
                <li>Review financial reports monthly</li>
                <li>Set up recurring transactions for regular items</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'schedule',
      title: 'Class Scheduling',
      icon: <FaCalendarAlt />,
      content: (
        <div className="help-content">
          <h3>Class Scheduling Guide</h3>
          <p>Organize your gym's classes and appointments efficiently:</p>

          <div className="feature-card">
            <h4><FaCalendarAlt /> Creating Classes</h4>
            <ol>
              <li>Navigate to <strong>Schedule</strong></li>
              <li>Click <strong>"Add New Class"</strong></li>
              <li>Fill in class details:
                <ul>
                  <li><strong>Class Name:</strong> Descriptive name for the class</li>
                  <li><strong>Instructor:</strong> Select from your staff list</li>
                  <li><strong>Time:</strong> Set start and end times</li>
                  <li><strong>Days:</strong> Choose which days the class runs</li>
                  <li><strong>Capacity:</strong> Maximum number of participants</li>
                </ul>
              </li>
              <li>Click <strong>"Save Class"</strong></li>
            </ol>
          </div>

          <div className="feature-card">
            <h4><FaUsers /> Managing Attendance</h4>
            <ul>
              <li><strong>Check-in:</strong> Mark members as present for classes</li>
              <li><strong>Waitlist:</strong> Manage overflow when classes are full</li>
              <li><strong>Attendance Reports:</strong> Track member participation</li>
              <li><strong>Instructor Performance:</strong> Monitor class popularity</li>
            </ul>
          </div>

          <div className="feature-card">
            <h4><FaExclamationTriangle /> Schedule Management</h4>
            <ul>
              <li><strong>Edit Classes:</strong> Modify existing class details</li>
              <li><strong>Cancel Classes:</strong> Handle unexpected cancellations</li>
              <li><strong>Reschedule:</strong> Move classes to different times</li>
              <li><strong>Recurring Classes:</strong> Set up regular weekly schedules</li>
            </ul>
          </div>

          <div className="tip-box">
            <FaLightbulb />
            <div>
              <h4>Scheduling Tips</h4>
              <ul>
                <li>Plan classes during peak hours for maximum attendance</li>
                <li>Leave buffer time between classes for setup</li>
                <li>Consider member preferences when scheduling popular classes</li>
                <li>Regularly review and adjust schedules based on attendance</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'staff',
      title: 'Staff Management',
      icon: <FaUsers />,
      content: (
        <div className="help-content">
          <h3>Staff Management Guide</h3>
          <p>Effectively manage your gym's staff and instructors:</p>

          <div className="feature-card">
            <h4><FaUsers /> Adding Staff Members</h4>
            <ol>
              <li>Go to <strong>Staff</strong> section</li>
              <li>Click <strong>"Add New Staff"</strong></li>
              <li>Enter staff information:
                <ul>
                  <li><strong>Personal Details:</strong> Name, contact information</li>
                  <li><strong>Position:</strong> Role and responsibilities</li>
                  <li><strong>Specializations:</strong> Areas of expertise</li>
                  <li><strong>Schedule:</strong> Working hours and availability</li>
                </ul>
              </li>
              <li>Click <strong>"Save Staff"</strong></li>
            </ol>
          </div>

          <div className="feature-card">
            <h4><FaCalendarAlt /> Staff Scheduling</h4>
            <ul>
              <li><strong>Work Hours:</strong> Set regular working schedules</li>
              <li><strong>Class Assignments:</strong> Assign instructors to specific classes</li>
              <li><strong>Availability:</strong> Track when staff are available</li>
              <li><strong>Substitutions:</strong> Handle staff absences and replacements</li>
            </ul>
          </div>

          <div className="feature-card">
            <h4><FaChartLine /> Performance Tracking</h4>
            <ul>
              <li><strong>Class Attendance:</strong> Monitor instructor popularity</li>
              <li><strong>Member Feedback:</strong> Track member satisfaction</li>
              <li><strong>Workload:</strong> Balance staff assignments</li>
              <li><strong>Training:</strong> Track certifications and development</li>
            </ul>
          </div>

          <div className="tip-box">
            <FaLightbulb />
            <div>
              <h4>Staff Management Best Practices</h4>
              <ul>
                <li>Maintain clear communication channels with staff</li>
                <li>Provide regular training and development opportunities</li>
                <li>Recognize and reward good performance</li>
                <li>Keep detailed records of certifications and qualifications</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'System Settings',
      icon: <FaCog />,
      content: (
        <div className="help-content">
          <h3>System Settings Guide</h3>
          <p>Customize your gym management system to fit your needs:</p>

          <div className="feature-card">
            <h4><FaCog /> General Settings</h4>
            <ul>
              <li><strong>Gym Information:</strong> Update gym name, address, contact details</li>
              <li><strong>Business Hours:</strong> Set operating hours</li>
              <li><strong>Timezone:</strong> Configure your local timezone</li>
              <li><strong>Currency:</strong> Set your preferred currency for financial records</li>
            </ul>
          </div>

          <div className="feature-card">
            <h4><FaUsers /> Membership Settings</h4>
            <ul>
              <li><strong>Membership Types:</strong> Define different membership categories</li>
              <li><strong>Pricing:</strong> Set rates for various membership levels</li>
              <li><strong>Auto-renewal:</strong> Configure automatic membership renewals</li>
              <li><strong>Late Fees:</strong> Set policies for overdue payments</li>
            </ul>
          </div>

          <div className="feature-card">
            <h4><FaExclamationTriangle /> Notification Settings</h4>
            <ul>
              <li><strong>Email Notifications:</strong> Configure automated email alerts</li>
              <li><strong>Expiration Reminders:</strong> Set up membership renewal notifications</li>
              <li><strong>Class Reminders:</strong> Send class schedule notifications</li>
              <li><strong>System Alerts:</strong> Configure important system notifications</li>
            </ul>
          </div>

          <div className="feature-card">
            <h4><FaChartLine /> Data Management</h4>
            <ul>
              <li><strong>Backup:</strong> Schedule regular data backups</li>
              <li><strong>Export:</strong> Export data for external analysis</li>
              <li><strong>Import:</strong> Import data from other systems</li>
              <li><strong>Archive:</strong> Archive old records to maintain performance</li>
            </ul>
          </div>

          <div className="tip-box">
            <FaLightbulb />
            <div>
              <h4>Settings Recommendations</h4>
              <ul>
                <li>Review and update settings monthly</li>
                <li>Test notification systems regularly</li>
                <li>Keep backup schedules current</li>
                <li>Document any custom configurations</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <FaExclamationTriangle />,
      content: (
        <div className="help-content">
          <h3>Common Issues & Solutions</h3>
          <p>Quick solutions for common problems:</p>

          <div className="trouble-card">
            <h4><FaExclamationTriangle /> Widgets Not Loading</h4>
            <p><strong>Problem:</strong> Dashboard widgets show loading or no data</p>
            <p><strong>Solution:</strong></p>
            <ul>
              <li>Check if the backend server is running</li>
              <li>Refresh the page</li>
              <li>Check your internet connection</li>
              <li>Clear browser cache and cookies</li>
            </ul>
          </div>

          <div className="trouble-card">
            <h4><FaExclamationTriangle /> Can't Save Data</h4>
            <p><strong>Problem:</strong> Unable to save member, financial, or other data</p>
            <p><strong>Solution:</strong></p>
            <ul>
              <li>Ensure all required fields are filled</li>
              <li>Check for valid email formats</li>
              <li>Verify date formats are correct</li>
              <li>Try refreshing the page and retry</li>
            </ul>
          </div>

          <div className="trouble-card">
            <h4><FaExclamationTriangle /> Search Not Working</h4>
            <p><strong>Problem:</strong> Search function doesn't find expected results</p>
            <p><strong>Solution:</strong></p>
            <ul>
              <li>Check spelling of search terms</li>
              <li>Try partial names or email addresses</li>
              <li>Clear search and try again</li>
              <li>Check if data exists in the system</li>
            </ul>
          </div>

          <div className="trouble-card">
            <h4><FaExclamationTriangle /> Performance Issues</h4>
            <p><strong>Problem:</strong> System runs slowly or freezes</p>
            <p><strong>Solution:</strong></p>
            <ul>
              <li>Close unnecessary browser tabs</li>
              <li>Clear browser cache</li>
              <li>Restart the application</li>
              <li>Check available system memory</li>
            </ul>
          </div>

          <div className="contact-info">
            <h4>Need More Help?</h4>
            <p>If you're still experiencing issues, please contact support with:</p>
            <ul>
              <li>Detailed description of the problem</li>
              <li>Steps to reproduce the issue</li>
              <li>Browser and operating system information</li>
              <li>Screenshots if applicable</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="help-page">
      <div className="help-header">
        <h1><FaQuestionCircle /> Help & Documentation</h1>
        <p>Comprehensive guide to using your gym management software</p>
      </div>

      <div className="help-container">
        <div className="help-sidebar">
          <nav className="help-nav">
            {sections.map((section) => (
              <button
                key={section.id}
                className={`help-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="nav-icon">{section.icon}</span>
                <span className="nav-title">{section.title}</span>
                <FaArrowRight className="nav-arrow" />
              </button>
            ))}
          </nav>
        </div>

        <div className="help-main">
          <div className="help-content-wrapper">
            {sections.find(section => section.id === activeSection)?.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help; 