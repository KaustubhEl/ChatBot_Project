import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { registerOrganization, getCategories, getSubtypes, getSubtypeClasses, getPackages, registerOrgAdmin, subscribePackage } from '../services/api';

// Validation Schema
const validationSchema = Yup.object().shape({
    name: Yup.string()
        .required('Organization name is required')
        .trim()
        .matches(/^[A-Za-z0-9.& -]{3,150}$/, 'Organization name must be 3-150 characters and contain only alphabets, numbers, space, ., &, and -'),
    categoryId: Yup.string().required('Category is required'),
    subtypeId: Yup.string().required('Subtype is required'),
    subtypeClassId: Yup.string().nullable().notRequired(),
    registrationNo: Yup.string()
        .required('Registration number is required')
        .trim()
        .matches(/^[A-Za-z0-9/-]{5,30}$/, 'Registration number must be 5-30 characters and contain only alphabets, numbers, / and -'),
    email: Yup.string()
        .email('Invalid email format')
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address')
        .required('Email is required'),
    phone: Yup.string()
        .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
        .required('Phone number is required'),
    websiteUrl: Yup.string()
        .matches(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/, 'Please enter a valid website URL')
        .notRequired(),
    address: Yup.string().notRequired()
});

// Admin Validation Schema
const adminValidationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits').required('Phone number is required'),
});

const RegisterOrganization = () => {
    const [step, setStep] = useState(1);
    const [organizationId, setOrganizationId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [packages, setPackages] = useState([]);
    const [selectedPackageId, setSelectedPackageId] = useState(null);
    
    // Dropdown states
    const [categories, setCategories] = useState([]);
    const [subtypes, setSubtypes] = useState([]);
    const [subtypeClasses, setSubtypeClasses] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingSubtypes, setLoadingSubtypes] = useState(false);
    const [loadingSubtypeClasses, setLoadingSubtypeClasses] = useState(false);
    const [subscribingPackage, setSubscribingPackage] = useState(false);

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
    const handleCategoryChange = async (e, setFieldValue) => {
        const categoryId = e.target.value;
        setFieldValue('categoryId', categoryId);
        setFieldValue('subtypeId', '');
        setFieldValue('subtypeClassId', '');
        
        if (categoryId) {
            setLoadingSubtypes(true);
            const response = await getSubtypes(categoryId);
            if (response.success) {
                setSubtypes(response.data);
            } else {
                setSubtypes([]);
            }
            setLoadingSubtypes(false);
            setSubtypeClasses([]);
        }
    };

    // Fetch subtype classes when subtype changes
    const handleSubtypeChange = async (e, setFieldValue) => {
        const subtypeId = e.target.value;
        setFieldValue('subtypeId', subtypeId);
        setFieldValue('subtypeClassId', '');
        
        if (subtypeId) {
            setLoadingSubtypeClasses(true);
            const response = await getSubtypeClasses(subtypeId);
            if (response.success) {
                setSubtypeClasses(response.data);
            } else {
                setSubtypeClasses([]);
            }
            setLoadingSubtypeClasses(false);
        }
    };

    // Fetch packages when entering step 2
    useEffect(() => {
        if (step === 2) {
            const fetchPackages = async () => {
                const response = await getPackages();
                if (response.success) {
                    setPackages(response.data.content || []);
                }
            };
            fetchPackages();
        }
    }, [step]);

    // Clear messages when changing steps
    useEffect(() => {
        setSuccessMessage('');
        setErrorMessage('');
    }, [step]);

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setSuccessMessage('');
        setErrorMessage('');
        debugger;
        try {
            const response = await registerOrganization(values);
            
            console.log('Final response:', response);

            if (response.success) {
                setSuccessMessage('Organization registered successfully! Proceeding to package selection...');
                setOrganizationId(response.data.organizationId || response.data.id); // Assuming ID is in response data
                setTimeout(() => setStep(2), 1500);
            } else {
                setErrorMessage(response.message || 'Failed to register organization');
            }
        } catch (error) {
            console.error('Submission error:', error);
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAdminSubmit = async (values, { setSubmitting }) => {
        setSuccessMessage('');
        setErrorMessage('');
        try {
            const response = await registerOrgAdmin(organizationId, values);
            if (response.success) {
                setSuccessMessage('Organization Admin registered successfully! Process Complete.');
                // Optionally redirect or reset here
            } else {
                setErrorMessage(response.message || 'Failed to register admin');
            }
        } catch (error) {
            console.error('Admin submission error:', error);
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePackageSubmit = async () => {
        setSuccessMessage('');
        setErrorMessage('');
        setSubscribingPackage(true);
        try {
            const response = await subscribePackage(organizationId, selectedPackageId);
            if (response.success) {
                setSuccessMessage('Package subscribed successfully!');
                setTimeout(() => setStep(3), 1000);
            } else {
                setErrorMessage(response.message || 'Failed to subscribe package');
            }
        } catch (error) {
            console.error('Package subscription error:', error);
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setSubscribingPackage(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Register New Organization</h1>
                    {/* Progress Bar could go here */}
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
                    {errorMessage && (
                        <div className="bg-red-50 border-b border-red-200 p-4 flex items-center gap-3">
                            <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-red-800 font-semibold">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Organization Form */}
                    {step === 1 && (
                    <Formik
                        initialValues={{
                            name: '',
                            categoryId: '',
                            subtypeId: '',
                            subtypeClassId: '',
                            registrationNo: '',
                            email: '',
                            phone: '',
                            websiteUrl: '',
                            address: ''
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ values, errors, touched, isSubmitting, setFieldValue }) => (
                            <Form className="p-8 space-y-8">
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
                                            <Field
                                                type="text"
                                                name="name"
                                                placeholder="Enter organization name"
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400 ${
                                                    touched.name && errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            />
                                            <ErrorMessage name="name">
                                                {msg => (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                                                        </svg>
                                                        {msg}
                                                    </p>
                                                )}
                                            </ErrorMessage>
                                        </div>

                                        {/* Registration No */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Registration No *
                                            </label>
                                            <Field
                                                type="text"
                                                name="registrationNo"
                                                placeholder="Enter registration number"
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400 ${
                                                    touched.registrationNo && errors.registrationNo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            />
                                            <ErrorMessage name="registrationNo">
                                                {msg => (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                                                        </svg>
                                                        {msg}
                                                    </p>
                                                )}
                                            </ErrorMessage>
                                        </div>

                                        {/* Category ID */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Category *
                                            </label>
                                            <Field
                                                as="select"
                                                name="categoryId"
                                                onChange={(e) => handleCategoryChange(e, setFieldValue)}
                                                disabled={loadingCategories}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 ${
                                                    touched.categoryId && errors.categoryId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            >
                                                <option value="">
                                                    {loadingCategories ? 'Loading categories...' : 'Select a category'}
                                                </option>
                                                {categories.map(category => (
                                                    <option key={category.categoryId} value={category.categoryId}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="categoryId">
                                                {msg => (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                                                        </svg>
                                                        {msg}
                                                    </p>
                                                )}
                                            </ErrorMessage>
                                        </div>

                                        {/* Subtype ID */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Subtype *
                                            </label>
                                            <Field
                                                as="select"
                                                name="subtypeId"
                                                onChange={(e) => handleSubtypeChange(e, setFieldValue)}
                                                disabled={!values.categoryId || loadingSubtypes}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 ${
                                                    touched.subtypeId && errors.subtypeId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            >
                                                <option value="">
                                                    {loadingSubtypes ? 'Loading subtypes...' : !values.categoryId ? 'Select a category first' : 'Select a subtype'}
                                                </option>
                                                {subtypes.map(subtype => (
                                                    <option key={subtype.subtypeId} value={subtype.subtypeId}>
                                                        {subtype.name}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="subtypeId">
                                                {msg => (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                                                        </svg>
                                                        {msg}
                                                    </p>
                                                )}
                                            </ErrorMessage>
                                        </div>

                                        {/* Subtype Class ID */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Subtype Class
                                            </label>
                                            <Field
                                                as="select"
                                                name="subtypeClassId"
                                                disabled={!values.subtypeId || loadingSubtypeClasses || subtypeClasses.length === 0}
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:bg-gray-100 ${
                                                    touched.subtypeClassId && errors.subtypeClassId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            >
                                                <option value="">
                                                    {loadingSubtypeClasses ? 'Loading classes...' : !values.subtypeId ? 'Select a subtype first' : subtypeClasses.length === 0 ? 'No classes available' : 'Select a subtype class'}
                                                </option>
                                                {subtypeClasses.map(subtypeClass => (
                                                    <option key={subtypeClass.subtypeClassId} value={subtypeClass.subtypeClassId}>
                                                        {subtypeClass.name}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="subtypeClassId">
                                                {msg => (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                                                        </svg>
                                                        {msg}
                                                    </p>
                                                )}
                                            </ErrorMessage>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Address
                                            </label>
                                            <Field
                                                type="text"
                                                name="address"
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
                                            <Field
                                                type="email"
                                                name="email"
                                                placeholder="Enter email address"
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400 ${
                                                    touched.email && errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            />
                                            <ErrorMessage name="email">
                                                {msg => (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                                                        </svg>
                                                        {msg}
                                                    </p>
                                                )}
                                            </ErrorMessage>
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Contact Number *
                                            </label>
                                            <Field
                                                type="tel"
                                                name="phone"
                                                placeholder="Enter 10-digit phone number"
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400 ${
                                                    touched.phone && errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            />
                                            <ErrorMessage name="phone">
                                                {msg => (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                                                        </svg>
                                                        {msg}
                                                    </p>
                                                )}
                                            </ErrorMessage>
                                        </div>

                                        {/* Website URL */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Website URL
                                            </label>
                                            <Field
                                                type="url"
                                                name="websiteUrl"
                                                placeholder="Enter website URL (e.g., https://example.com)"
                                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder-gray-400 ${
                                                    touched.websiteUrl && errors.websiteUrl ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                                }`}
                                            />
                                            <ErrorMessage name="websiteUrl">
                                                {msg => (
                                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 16.586l-3.293-3.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
                                                        </svg>
                                                        {msg}
                                                    </p>
                                                )}
                                            </ErrorMessage>
                                        </div>
                                    </div>
                                </div>

                           
                                {/* Submit Buttons */}
                                <div className="flex gap-4 pt-6">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                    >
                                        {isSubmitting ? (
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
                            </Form>
                        )}
                    </Formik>
                    )}

                    {/* Step 2: Package Selection */}
                    {step === 2 && (
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                                Select a Package
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {packages.map((pkg) => (
                                    <div 
                                        key={pkg.packageId}
                                        onClick={() => setSelectedPackageId(pkg.packageId)}
                                        className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                                            selectedPackageId === pkg.packageId 
                                            ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50' 
                                            : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                {pkg.categoryName}
                                            </span>
                                        </div>
                                        <div className="text-3xl font-bold text-gray-900 mb-4">
                                            ${pkg.price} <span className="text-sm text-gray-500 font-normal">/ {pkg.renewalFrequencyLabel}</span>
                                        </div>
                                        <ul className="space-y-2 text-gray-600">
                                            <li className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                User Limit: {pkg.userLimit}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Renewal: {pkg.renewalFrequency} months
                                            </li>
                                        </ul>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handlePackageSubmit}
                                    disabled={!selectedPackageId || subscribingPackage}
                                    className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition duration-200 flex items-center gap-2"
                                >
                                    {subscribingPackage ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Processing...
                                        </>
                                    ) : 'Next Step'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Admin Registration */}
                    {step === 3 && (
                        <Formik
                            initialValues={{
                                firstName: '',
                                lastName: '',
                                email: '',
                                phone: ''
                            }}
                            validationSchema={adminValidationSchema}
                            onSubmit={handleAdminSubmit}
                        >
                            {({ isSubmitting }) => (
                                <Form className="p-8 space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                                        Register Organization Admin
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {['firstName', 'lastName', 'email', 'phone'].map((field) => (
                                            <div key={field}>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                                                    {field.replace(/([A-Z])/g, ' $1').trim()} *
                                                </label>
                                                <Field
                                                    type={field === 'email' ? 'email' : 'text'}
                                                    name={field}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                                <ErrorMessage name={field}>
                                                    {msg => <p className="text-red-600 text-sm mt-1">{msg}</p>}
                                                </ErrorMessage>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg transition duration-200 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? 'Registering Admin...' : 'Complete Registration'}
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    )}

                    {/* Bottom Stepper */}
                    <div className="bg-gray-50 px-6 py-6 border-t border-gray-200">
                        <div className="flex items-center justify-center">
                            {/* Step 1 */}
                            <div className={`flex flex-col items-center ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors duration-200 ${
                                    step > 1 ? 'bg-green-500 border-green-500 text-white' : 
                                    step === 1 ? 'bg-indigo-600 border-indigo-600 text-white' : 
                                    'bg-white border-gray-300 text-gray-400'
                                }`}>
                                    {step > 1 ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : '1'}
                                </div>
                                <span className="text-xs font-semibold mt-1">Org Details</span>
                            </div>

                            {/* Connector 1-2 */}
                            <div className={`w-16 h-1 mx-2 rounded transition-colors duration-200 ${step >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>

                            {/* Step 2 */}
                            <div className={`flex flex-col items-center ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors duration-200 ${
                                    step > 2 ? 'bg-green-500 border-green-500 text-white' : 
                                    step === 2 ? 'bg-indigo-600 border-indigo-600 text-white' : 
                                    'bg-white border-gray-300 text-gray-400'
                                }`}>
                                    {step > 2 ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : '2'}
                                </div>
                                <span className="text-xs font-semibold mt-1">Package</span>
                            </div>

                            {/* Connector 2-3 */}
                            <div className={`w-16 h-1 mx-2 rounded transition-colors duration-200 ${step >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>

                            {/* Step 3 */}
                            <div className={`flex flex-col items-center ${step >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors duration-200 ${
                                    step === 3 ? 'bg-indigo-600 border-indigo-600 text-white' : 
                                    'bg-white border-gray-300 text-gray-400'
                                }`}>
                                    3
                                </div>
                                <span className="text-xs font-semibold mt-1">Admin</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterOrganization;
