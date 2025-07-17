// src/components/CowManagement.tsx (assuming it's directly in components, or adjust path)
// If this is a page, e.g., src/app/cattlefarmmanagement/cows/page.tsx, then add 'use client';
// and import useRouter from 'next/navigation'.

import { useState, useEffect } from 'react';
import { Plus, Search, Tag } from 'lucide-react'; // Added Tag icon
import { useRouter } from 'next/navigation'; // Import useRouter for client-side navigation
import { CowService } from '../lib/cowService'; // Adjusted path
import type { Cow } from '../types'; // Adjusted path
import AddEditCowModal from './cows/AddEditCowModal'; // Assuming this path is correct

const CowManagement = () => {
  const router = useRouter(); // Initialize useRouter
  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: 'Active' as Cow['status'],
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Debounce search input to avoid excessive API calls
    const handler = setTimeout(() => {
      loadCows();
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [filters, search]); // Re-run effect when filters or search changes (after debounce)

  const loadCows = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await CowService.getCows({
        status: filters.status,
        search: search.trim()
      });
      // Sort cows by tag_number for consistent display
      const sortedCows = data.sort((a, b) => a.tag_number.localeCompare(b.tag_number));
      setCows(sortedCows);
    } catch (error) {
      console.error('Error loading cows:', error);
      setError('Failed to load animals. Please try again later.'); // User-friendly message
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCow = async (cowData: Omit<Cow, 'id'>) => {
    try {
      setLoading(true);
      setError(''); // Clear any previous error
      await CowService.saveCow(cowData);
      setShowAddModal(false);
      await loadCows(); // Reload cows to show the new/updated one
    } catch (error: any) {
      console.error('Error saving cow:', error);
      // Pass the error message back to the modal, or display it here if needed
      // For now, we'll let the modal handle its own error display (as per its code)
      throw error; // Re-throw so AddEditCowModal can catch and display
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string | undefined) => {
    if (!dob) return 'N/A'; // Changed to N/A for cleaner display
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 'Invalid Date'; // Handle invalid date strings

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} years` : 'N/A'; // Ensure age is not negative
  };

  const getStatusColor = (status: Cow['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'Sold':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Deceased':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Inactive': // Assuming Inactive is a possible status
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };

  const handleRowClick = (cowId: string) => {
    router.push(`/cattlefarmmanagement/cows/${cowId}`); // Use useRouter for navigation
  };

  // Common input and label styling
  const inputClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";
  const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-200";

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen"> {/* Light background */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
          <Tag className="h-8 w-8 mr-3 text-green-600" /> {/* Themed icon */}
          Animal Registry
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-3" />
          Register New Animal
        </button>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Filter & Search Animals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="search" className={labelClassName}>Search by Tag Number</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g., A123, B456"
                className={inputClassName + " pl-10"} // Added padding for icon
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="statusFilter" className={labelClassName}>Filter by Status</label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as Cow['status'] }))}
              className={inputClassName}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Sold">Sold</option>
              <option value="Deceased">Deceased</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-lg shadow-sm">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Cows List Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div> {/* Themed spinner */}
          </div>
        ) : cows.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50"> {/* Themed table header */}
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                  Tag Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                  Age Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100"> {/* Lighter divider */}
              {cows.map((cow) => (
                <tr
                  key={cow.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  onClick={() => handleRowClick(cow.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {cow.tag_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {cow.gender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {cow.age_category} ({calculateAge(cow.date_of_birth)})
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {cow.color}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(cow.status)}`}>
                      {cow.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-600">
            No animals found matching the current criteria.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <AddEditCowModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSaveCow}
        />
      )}
    </div>
  );
};

export default CowManagement;