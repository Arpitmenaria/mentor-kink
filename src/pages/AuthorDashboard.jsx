import { useState } from 'react';
import { LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import MembersPage from './MembersPage';
import UserManagementPage from './UserManagementPage';
import ReportedPostsPage from './ReportedPostsPage';
import ReportedCommentsPage from './ReportedCommentsPage';
import ReportedChatsPage from './ReportedChatsPage';
import EventManagementPage from './EventManagementPage';
import GroupManagementPage from './GroupManagementPage';
import ReportedGroupsPage from './ReportedGroupsPage';
import ReportedEventsPage from './ReportedEventsPage';
import './AuthorDashboard.css';

export default function AuthorDashboard({ authorData, onLogout }) {
  const [activeTab, setActiveTab] = useState('active');
  const [activeSection, setActiveSection] = useState('members');
  const [activeItem, setActiveItem] = useState('active-members');

  const handleActiveChange = (update) => {
    if (update.activeTab) {
      setActiveTab(update.activeTab);
    }
    if (update.activeSection) {
      setActiveSection(update.activeSection);
    }
    if (update.activeItem) {
      setActiveItem(update.activeItem);
    }
  };

  const renderPage = () => {
    if (activeSection === 'members') {
      if (activeItem === 'active-members') {
        return <UserManagementPage />;
      }
      return <MembersPage activeTab={activeTab} />;
    }
    if (activeSection === 'users') {
      return <UserManagementPage />;
    }
    if (activeSection === 'posts') {
      return <ReportedPostsPage />;
    }
    if (activeSection === 'comments') {
      return <ReportedCommentsPage />;
    }
    if (activeSection === 'chats') {
      return <ReportedChatsPage />;
    }
    if (activeSection === 'events') {
      return <EventManagementPage />;
    }
    if (activeSection === 'reported-events') {
      return <ReportedEventsPage />;
    }
    if (activeSection === 'groups') {
      return <GroupManagementPage />;
    }
    if (activeSection === 'reported-groups') {
      return <ReportedGroupsPage />;
    }
    return <MembersPage activeTab={activeTab} />;
  };

  const getPageTitle = () => {
    if (activeSection === 'members') {
      if (activeItem === 'active-members') return 'Active Members';
      return 'Pending Requests';
    }
    if (activeSection === 'users') return 'Feed Management';
    if (activeSection === 'posts') return 'Reported Posts';
    if (activeSection === 'comments') return 'Reported Comments';
    if (activeSection === 'chats') return 'Reported Chats';
    if (activeSection === 'events') return 'Event Management';
    if (activeSection === 'reported-events') return 'Reported Events';
    if (activeSection === 'groups') return 'Group Management';
    if (activeSection === 'reported-groups') return 'Reported Groups';
    return 'Active Members';
  };

  return (
    <div className="author-dashboard">
      {/* Sidebar */}
      <Sidebar onActiveChange={handleActiveChange} />

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Header */}
        <div className="dashboard-top-bar">
          <div className="top-bar-content">
            <div></div>
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        {renderPage()}
      </div>
    </div>
  );
}
