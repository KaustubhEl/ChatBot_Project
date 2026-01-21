import React, { useState, useEffect } from 'react';
import { getOrganizations } from '../services/api';

const OrganizationList = () => {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Pagination & Sorting state
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [sort, setSort] = useState('name,asc'); // Default sort
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(0); // Reset to first page on search change
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchOrganizations = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page,
                size,
                sort,
                search: debouncedSearch
            };
            const response = await getOrganizations(params);
            if (response.success) {
                // Handle Spring Page response or flat array fallback
                const content = response.data.content || (Array.isArray(response.data) ? response.data : []);
                setOrganizations(content);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || content.length);
            } else {
                setError(response.message || 'Failed to fetch organizations');
            }
        } catch (err) {
            setError('An error occurred while fetching data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, [page, size, sort, debouncedSearch]);

    const handleSort = (field) => {
        const [currentField, currentDir] = sort.split(',');
        let newDir = 'asc';
        if (currentField === field && currentDir === 'asc') {
            newDir = 'desc';
        }
        setSort(`${field},${newDir}`);
    };

    const renderSortIcon = (field) => {
        const [currentField, currentDir] = sort.split(',');
        if (currentField !== field) return <span className="text-gray-400 ml-1">↕</span>;
        return currentDir === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
    };

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        A list of all registered organizations including their name, category, email, and contact details.
                    </p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full max-w-md rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5"
                />
            </div>

            {/* Table */}
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['name', 'category', 'subtype', 'subtypeClass', 'email', 'phone'].map((field) => (
                                            <th
                                                key={field}
                                                scope="col"
                                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 select-none"
                                                onClick={() => handleSort(field)}
                                            >
                                                <div className="flex items-center capitalize">
                                                    {field.replace(/([A-Z])/g, ' $1').trim()}
                                                    {renderSortIcon(field)}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="px-3 py-10 text-center text-sm text-gray-500">
                                                <div className="flex justify-center items-center">
                                                    <svg className="animate-spin h-5 w-5 mr-3 text-indigo-600" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Loading...
                                                </div>
                                            </td>
                                        </tr>
                                    ) : error ? (
                                        <tr>
                                            <td colSpan="6" className="px-3 py-4 text-center text-sm text-red-500">
                                                {error}
                                            </td>
                                        </tr>
                                    ) : organizations.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-3 py-4 text-center text-sm text-gray-500">
                                                No organizations found.
                                            </td>
                                        </tr>
                                    ) : (
                                        organizations.map((org) => (
                                            <tr key={org.organizationId} className="hover:bg-gray-50">
                                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{org.name}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{org.category}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{org.subtype}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{org.subtypeClass || '-'}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{org.email}</td>
                                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{org.phone}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page >= totalPages - 1}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{totalElements > 0 ? page * size + 1 : 0}</span> to <span className="font-medium">{Math.min((page + 1) * size, totalElements)}</span> of{' '}
                            <span className="font-medium">{totalElements}</span> results
                        </p>
                    </div>
                    <div className="flex items-center">
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => setPage(0)}
                                disabled={page === 0}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100"
                                title="First Page"
                            >
                                <span className="sr-only">First</span>
                                «
                            </button>
                            <button
                                onClick={() => setPage(Math.max(0, page - 1))}
                                disabled={page === 0}
                                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100"
                                title="Previous Page"
                            >
                                <span className="sr-only">Previous</span>
                                ‹
                            </button>
                            <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                                Page {page + 1} of {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page >= totalPages - 1}
                                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100"
                                title="Next Page"
                            >
                                <span className="sr-only">Next</span>
                                ›
                            </button>
                            <button
                                onClick={() => setPage(totalPages - 1)}
                                disabled={page >= totalPages - 1}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:bg-gray-100"
                                title="Last Page"
                            >
                                <span className="sr-only">Last</span>
                                »
                            </button>
                        </nav>
                        <select
                            value={size}
                            onChange={(e) => {
                                setSize(Number(e.target.value));
                                setPage(0);
                            }}
                            className="ml-4 block rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm border"
                        >
                            <option value={5}>5 / page</option>
                            <option value={10}>10 / page</option>
                            <option value={20}>20 / page</option>
                            <option value={50}>50 / page</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizationList;