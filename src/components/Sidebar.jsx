import { useState, useEffect } from 'react';
import { Users, Settings, Calendar, Globe, ChevronDown, Music, Share2 } from 'lucide-react';
import './Sidebar.css';

const sidebarMenu = [
  {
    id: 'members',
    label: 'Members',
    icon: Users,
    collapsible: true,
    defaultOpen: true,
    items: [
      { id: 'active-members', label: 'Active Members', activeTab: 'active' },
      { id: 'pending-requests', label: 'Pending Requests', activeTab: 'pending' },
    ],
  },
  {
    id: 'management',
    label: 'Feed Management',
    icon: Settings,
    collapsible: true,
    defaultOpen: true,
    items: [
      { id: 'reported-posts', label: 'Reported Posts', section: 'posts' },
      { id: 'reported-comments', label: 'Reported Comments', section: 'comments' },
      { id: 'reported-chats', label: 'Reported Chats', section: 'chats' },
    ],
  },
  {
    id: 'groups',
    label: 'Group Management',
    icon: Users,
    collapsible: true,
    defaultOpen: true,
    items: [
      { id: 'groups', label: 'Groups', section: 'groups' },
      { id: 'reported-groups', label: 'Reported Groups', section: 'reported-groups' },
    ],
  },
  // {
  //   id: 'events',
  //   label: 'Event Management',
  //   icon: Calendar,
  //   collapsible: true,
  //   defaultOpen: true,
  //   items: [
  //     { id: 'events', label: 'Events', section: 'events' },
  //     { id: 'reported-events', label: 'Reported Events', section: 'reported-events' },
  //   ],
  // },
];

export default function Sidebar({ onActiveChange, onInviteClick }) {
  const [activeSection, setActiveSection] = useState('active-members');
  const [expandedSections, setExpandedSections] = useState({
    members: true,
    management: true,
    groups: true,
    events: true,
  });
  const [orgName, setOrgName] = useState('Club24');
  const [orgLogo, setOrgLogo] = useState(null);
  const [isInviteOnly, setIsInviteOnly] = useState(false);

  useEffect(() => {
    const org = JSON.parse(localStorage.getItem('organization') || '{}');
    if (org.name) setOrgName(org.name);
    if (org.logo) setOrgLogo(org.logo);
    if (org.visibility === 'invite-only') setIsInviteOnly(true);
  }, []);

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleItemClick = (item, parentSectionId) => {
    setActiveSection(item.id);
    if (item.activeTab) {
      // For members section items, navigate to 'members' section with tab
      onActiveChange({ activeSection: parentSectionId, activeTab: item.activeTab, activeItem: item.id });
    } else if (item.section) {
      onActiveChange({ activeSection: item.section });
    }
  };

  const handleSectionClick = (section) => {
    if (section.collapsible) {
      toggleSection(section.id);
    } else {
      setActiveSection(section.id);
      if (section.section) {
        onActiveChange({ activeSection: section.section });
      }
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="header-icon-title">
          {orgLogo ? (
            <img src={orgLogo} alt={orgName} className="org-logo" />
          ) : (
            <Music size={24} className="logo-icon" />
          )}
          <h2>{orgName}</h2>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sidebarMenu.map((section) => {
          const IconComponent = section.icon;

          return (
            <div key={section.id} className="sidebar-section-wrapper">
              <button
                onClick={() => handleSectionClick(section)}
                className={`sidebar-section-button ${
                  !section.collapsible && activeSection === section.id ? 'active' : ''
                }`}
              >
                <IconComponent size={18} className="section-icon" />
                <span className="section-label">{section.label}</span>
                {section.collapsible && (
                  <ChevronDown
                    size={16}
                    className={`chevron ${expandedSections[section.id] ? 'expanded' : ''}`}
                  />
                )}
              </button>

              {section.collapsible && expandedSections[section.id] && section.items && (
                <div className="sidebar-submenu">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item, section.id)}
                      className={`sidebar-subitem ${activeSection === item.id ? 'active' : ''}`}
                      style={activeSection === item.id ? { backgroundColor: 'var(--color-nav-pill)', color: 'var(--color-nav-active)' } : {}}
                    >
                      <span className="bullet">•</span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {isInviteOnly && (
        <div className="sidebar-footer">
          <button className="invite-btn" onClick={onInviteClick}>
            <Share2 size={18} />
            Invite
          </button>
        </div>
      )}
    </div>
  );
}
