import React, { useState, useEffect } from 'react';
import { registerOrganization, getCategories, getSubtypes, getSubtypeClasses } from '../services/api';

const RegisterOrganization = () => {
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        subtypeId: '',
        subtypeClassId: '',
        registrationNo: '',
        email: '',
        phone: '',
        websiteUrl: '',
        address: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    
    // Dropdown states
    const [categories, setCategories] = useState([]);
    const [subtypes, setSubtypes] = useState([]);
    const [subtypeClasses, setSubtypeClasses] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubtypes, setLoadingSubtypes] = useState(false);
    const [loadingSubtypeClasses, setLoadingSubtypeClasses] = useState(false);

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            const response = await getCategories();
            if (response.success) {
                setCategories(response.data);
            }
            setLoadingCategories(false);
        };
        fetchCategories();
    }, []);

    // Fetch subtypes when category changes
    useEffect(() => {
        if (formData.categoryId) {
            const fetchSubtypes = async () => {
                setLoadingSubtypes(true);
                const response = await getSubtypes(formData.categoryId);
                if (response.success) {
                    setSubtypes(response.data);
                } else {
                    setSubtypes([]);
                }
                setLoadingSubtypes(false);
            };
            fetchSubtypes();
            // Reset subtypes and subtype classes when category changes
            setFormData(prev => ({
                ...prev,
                subtypeId: '',
                subtypeClassId: ''
            }));
            setSubtypeClasses([]);
        }
    }, [formData.categoryId]);

    // Fetch subtype classes when subtype changes
    useEffect(() => {
        if (formData.subtypeId) {
            const fetchSubtypeClasses = async () => {
                setLoadingSubtypeClasses(true);
                const response = await getSubtypeClasses(formData.subtypeId);
                if (response.success) {
                    setSubtypeClasses(response.data);
                } else {
                    setSubtypeClasses([]);
                }
                setLoadingSubtypeClasses(false);
            };
            fetchSubtypeClasses();
            // Reset subtype class when subtype changes
            setFormData(prev => ({
                ...prev,
                subtypeClassId: ''
            }));
        }
    }, [formData.subtypeId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrors({});

        // Call the registerOrganization API
        const response = await registerOrganization(formData);
        
        console.log('Final response:', response);

        if (response.success) {
            setSuccessMessage('Organization registered successfully!');
            // Reset form
            setFormData({
                name: '',
                categoryId: '',
                subtypeId: '',
                subtypeClassId: '',
                registrationNo: '',
                email: '',
                phone: '',
                websiteUrl: '',
                address: '',
                password: '',
                confirmPassword: ''
            });
        } else {
            setErrors({ submit: response.message || 'Failed to register organization' });
        }

        setLoading(false);
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Register New Organization</h1>
                    <p className="text-gray-600 mt-2">Create a new organization account by filling in the details below</p>
                </div>

                {/* Main Form Card */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    {/* Success Message */}
                    {successMessage && (
                        <div className="bg-green-50 border-b border-green-200 p-4 flex items-center gap-3">
                            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-green-800 font-semibold">{successMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="bg-red-50 border-b border-red-200 p-4 flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-red-800 font-semibold">{errors.submit}</p>
                            </div>
                        </div>
                    )}
                    <form className="p-8 space-y-8" onSubmit={handleSubmit}>
                        {/* Organization Information Section */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
                                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                                </svg>
                                Organization Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Organization Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Organization Name *
                                    </label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        placeholder="Enter organization name"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                                        required
                                    />
                                </div>

                                {/* Registration No */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Registration No *
                                    </label>
                                    <input 
                                        type="text" 
                                        name="registrationNo" 
                                        value={formData.registrationNo} 
                                        onChange={handleChange} 
                                        placeholder="Enter registration number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                                        required
                                    />
                                </div>

                                {/* Category ID */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select 
                                        name="categoryId" 
                                        value={formData.categoryId} 
                                        onChange={handleChange}
                                        disabled={loadingCategories}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:bg-gray-100"
                                        required
                                    >
                                        <option value="">
                                            {loadingCategories ? 'Loading categories...' : 'Select a category'}
                                        </option>
                                        {categories.map(category => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subtype ID */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subtype *
                                    </label>
                                    <select 
                                        name="subtypeId" 
                                        value={formData.subtypeId} 
                                        onChange={handleChange}
                                        disabled={!formData.categoryId || loadingSubtypes}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:bg-gray-100"
                                        required
                                    >
                                        <option value="">
                                            {loadingSubtypes ? 'Loading subtypes...' : !formData.categoryId ? 'Select a category first' : 'Select a subtype'}
                                        </option>
                                        {subtypes.map(subtype => (
                                            <option key={subtype.subtypeId} value={subtype.subtypeId}>
                                                {subtype.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subtype Class ID */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subtype Class *
                                    </label>
                                    <select 
                                        name="subtypeClassId" 
                                        value={formData.subtypeClassId} 
                                        onChange={handleChange}
                                        disabled={!formData.subtypeId || loadingSubtypeClasses}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:bg-gray-100"
                                        required
                                    >
                                        <option value="">
                                            {loadingSubtypeClasses ? 'Loading classes...' : !formData.subtypeId ? 'Select a subtype first' : 'Select a subtype class'}
                                        </option>
                                        {subtypeClasses.map(subtypeClass => (
                                            <option key={subtypeClass.subtypeClassId} value={subtypeClass.subtypeClassId}>
                                                {subtypeClass.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <input 
                                        type="text" 
                                        name="address" 
                                        value={formData.address} 
                                        onChange={handleChange} 
                                        placeholder="Enter address"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
                                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.346.836.92 1.875 1.554 2.692.634.816 1.693 1.142 2.693.952.99-.19 1.813-.637 2.382-1.278l1.55-1.78a1 1 0 011.448.087l4.204 4.204a1 1 0 010 1.414l-1.414 1.414a2 2 0 01-2.828 0l-2.83-2.83a2 2 0 00-2.828 0l-2.83 2.83a2 2 0 01-2.828 0L2.586 15A1 1 0 012 13.586V3z" />
                                </svg>
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        placeholder="Enter email address"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Contact Number
                                    </label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        placeholder="Enter phone number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                                    />
                                </div>

                                {/* Website URL */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Website URL
                                    </label>
                                    <input 
                                        type="url" 
                                        name="websiteUrl" 
                                        value={formData.websiteUrl} 
                                        onChange={handleChange} 
                                        placeholder="Enter website URL"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security Section */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 flex items-center gap-2">
                                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Security
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Password *
                                    </label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        placeholder="Enter password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                                        required
                                    />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Confirm Password *
                                    </label>
                                    <input 
                                        type="password" 
                                        name="confirmPassword" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                        placeholder="Confirm password"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 pt-6">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Registering...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Register Organization
                                    </>
                                )}
                            </button>
                            <button 
                                type="reset" 
                                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition duration-200"
                            >
                                Clear
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterOrganization;
