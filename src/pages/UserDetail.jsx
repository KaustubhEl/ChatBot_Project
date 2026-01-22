import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getOrganizations, updateMe } from '../services/api';

const UserDetail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [errors, setErrors] = useState({});
  const [userRole, setUserRole] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    organizationId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, orgResponse] = await Promise.all([
          getMe(),
          getOrganizations({ page: 0, size: 100 })
        ]);

        if (userResponse.success) {
          const user = userResponse.data;
          setUserRole(user.role);
          setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone ? user.phone.replace(/^\+91/, '') : '',
            organizationId: user.organization?.organizationId || user.departmentId || ''
          });
        } else {
          setError(userResponse.message || 'Failed to load user details');
        }

        if (orgResponse.success) {
          const content = orgResponse.data.content || (Array.isArray(orgResponse.data) ? orgResponse.data : []);
          setOrganizations(content);
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      if (numericValue.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numericValue }));
        if (numericValue.length > 0 && numericValue.length < 10) {
          setErrors(prev => ({ ...prev, phone: 'Phone number must be exactly 10 digits' }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.phone;
            return newErrors;
          });
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      if (name === 'firstName' || name === 'lastName') {
        if (!value.trim()) {
          setErrors(prev => ({ ...prev, [name]: `${name === 'firstName' ? 'First Name' : 'Last Name'} is required` }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        ...formData,
        phone: formData.phone ? `+91${formData.phone}` : ''
      };
      const response = await updateMe(payload);
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-gray-600">Loading details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900 font-medium">
          Cancel
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
        {success && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${errors.firstName ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-300'}`} required />
              {errors.firstName && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                  </svg>
                  {errors.firstName}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
              <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${errors.lastName ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-300'}`} required />
              {errors.lastName && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                  </svg>
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium select-none">+91</span>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={`w-full pl-12 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 ${errors.phone ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-300'}`} placeholder="9876543210" />
            </div>
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                </svg>
                {errors.phone}
              </p>
            )}
          </div>

          {userRole !== 'SUPER_ADMIN' && userRole !== 'ORG_ADMIN' && (
            <div>
              <label htmlFor="organizationId" className="block text-sm font-semibold text-gray-700 mb-2">Department (Organization)</label>
              <select id="organizationId" name="organizationId" value={formData.organizationId} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">
                <option value="">Select Department</option>
                {organizations.map(org => <option key={org.organizationId} value={org.organizationId}>{org.name}</option>)}
              </select>
            </div>
          )}

          <div className="pt-4">
            <button type="submit" disabled={saving} className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2">
              {saving ? <><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDetail;