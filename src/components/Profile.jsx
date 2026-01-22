import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMe();
        if (response.success) {
          setProfile(response.data);
          setError(null);
        } else {
          setError(response.message || 'Failed to load profile');
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block">
            <svg
              className="animate-spin h-12 w-12 text-indigo-600"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }
  // Format user name and role
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName?.charAt(0)}${profile.lastName?.charAt(0)}`.toUpperCase();
  const roleDisplay = profile.role?.replace(/_/g, ' ') || 'User';

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <svg
            className="h-8 w-8 text-red-500 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-yellow-800 font-medium">No profile data available</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-6">
            <div className="w-32 h-32 bg-white rounded-lg border-4 border-white shadow-lg flex items-center justify-center">
              <span className="text-4xl font-bold text-indigo-600">{initials}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-gray-600 mt-1 capitalize font-medium">{roleDisplay}</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard/user-detail')}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition duration-200 w-full sm:w-auto"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      {/* Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM9 10a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            Personal Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <p className="text-gray-900 mt-1 font-medium">{fullName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <p className="text-gray-900 mt-1 break-all">{profile.email}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700">User ID</label>
              <p className="text-gray-900 mt-1 text-xs font-mono break-all">{profile.userId}</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-indigo-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
                clipRule="evenodd"
              />
            </svg>
            Account Details
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Role</span>
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold capitalize">
                {roleDisplay}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Status</span>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                profile.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {profile.active ? '✓ Active' : '✗ Inactive'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Organization</span>
              <span className="text-gray-900 font-semibold">{profile.organization?.name || (typeof profile.organization === 'string' ? profile.organization : 'N/A')}</span>
            </div>
          </div>
        </div>

     
    </div>
    </div>
  );
};

export default Profile;
