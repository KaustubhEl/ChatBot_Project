import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ onClose, isCollapsed, onToggleCollapse, profile }) => {
  const userRole = profile?.role;

  const menuItems = [
    { 
      label: 'Dashboard ', 
      path: '/dashboard', 
      icon: 'M3 12a9 9 0 0110 8.95V22H7a2 2 0 01-2-2v-6.5V12zm0 0h4v-4a1 1 0 011-1h6a1 1 0 011 1v4h4V7a1 1 0 011 1v4h4' 
    },
    { 
      label: 'Register New Organization', 
      path: '/dashboard/register-organization', 
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      roles: ['SUPER_ADMIN']
    },
    { 
      label: 'Organization List', 
      path: '/dashboard/organization-list', 
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      roles: ['SUPER_ADMIN']
    },
     ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.roles || (userRole && item.roles.includes(userRole))
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-600 to-indigo-700">
      {/* Header with Logo and Collapse Button */}
      <div className="px-4 py-6 border-b border-indigo-500 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
             
              ChatBot Application
            </h2>
            <p className="text-indigo-100 text-xs mt-2">ChatBot Application</p>
          </div>
        )}
        
        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-indigo-500 transition duration-200 flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-6 space-y-2">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className="flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-lg text-indigo-100 hover:bg-indigo-500 transition duration-200 group"
            title={isCollapsed ? item.label : ''}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 text-indigo-200 group-hover:text-white transition"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={item.icon}
              />
            </svg>
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* User Info / Footer */}
      <div className="px-2 py-4 border-t border-indigo-500">
        <div className={`flex items-center gap-3 p-3 rounded-lg bg-indigo-500/30 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-600 font-bold text-sm">
              {profile ? `${profile.firstName?.charAt(0)}${profile.lastName?.charAt(0)}`.toUpperCase() : 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {profile ? `${profile.firstName} ${profile.lastName}` : 'User Name'}
              </p>
              <p className="text-indigo-200 text-xs truncate">{profile ? profile.email : 'user@example.com'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
