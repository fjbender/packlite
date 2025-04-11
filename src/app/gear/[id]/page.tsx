'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useGearItem, useDeleteGear, useUpdateGear } from '@/lib/hooks/useGear';
import { GearItem } from '@/lib/api/gearApi';
import Link from 'next/link';

export default function GearDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = !!session;
  const isAuthLoading = authStatus === 'loading';
  
  // Explicitly type the data from useGearItem as GearItem
  const { data: gearData, isLoading: isGearLoading, error } = useGearItem(id, {
    enabled: isAuthenticated // Only fetch gear if user is authenticated
  });
  
  // Use type assertion to ensure proper typing
  const gear = gearData as GearItem;
  
  const deleteMutation = useDeleteGear();
  const updateMutation = useUpdateGear();
  const [isEditing, setIsEditing] = useState(false);
  
  // Define a proper type for the form data
  type FormDataType = {
    name: string;
    category: string;
    weight: string; // Using string for input field
    weightUnit: string;
    essential: boolean;
    condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    notes: string;
  };

  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    category: '',
    weight: '',
    weightUnit: 'g',
    essential: false,
    condition: 'Good',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize the form data when the gear is loaded
  useEffect(() => {
    if (gear) {
      setFormData({
        name: gear.name,
        category: gear.category,
        weight: gear.weight.toString(),
        weightUnit: gear.weightUnit || 'g',
        essential: gear.essential,
        condition: gear.condition,
        notes: gear.notes || ''
      });
    }
  }, [gear]);

  // Handle input changes in edit mode
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.weight) {
      newErrors.weight = 'Weight is required';
    } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
      newErrors.weight = 'Please enter a valid weight';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save changes
  const handleSave = async () => {
    if (validateForm() && gear) {
      const updatedGear = {
        ...gear,
        name: formData.name,
        category: formData.category,
        weight: parseFloat(formData.weight),
        weightUnit: formData.weightUnit,
        essential: formData.essential,
        condition: formData.condition,
        notes: formData.notes
      };
      
      try {
        await updateMutation.mutateAsync(updatedGear);
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to update gear:', error);
      }
    }
  };

  // Handle delete gear item
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this gear item?')) {
      try {
        await deleteMutation.mutateAsync(id);
        router.push('/gear');
      } catch (error) {
        console.error('Failed to delete gear:', error);
      }
    }
  };

  // Categories for gear items
  const categories = [
    'Packs',
    'Shelter',
    'Sleep System',
    'Cooking',
    'Water',
    'Clothing',
    'Essentials',
    'Electronics',
    'First Aid',
    'Miscellaneous'
  ];

  // Conditions for gear items
  const conditions = [
    'Excellent',
    'Good',
    'Fair',
    'Poor'
  ];

  // If auth session is loading, show loading state
  if (isAuthLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center p-8 bg-white dark:bg-gray-800 shadow rounded-lg">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">View Gear Details</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to view gear details.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/login" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isGearLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded col-span-1"></div>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">
                Error loading gear item. Please try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gear) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                Gear item not found.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Link 
            href="/gear" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Gear List
          </Link>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link href="/gear" className="hover:text-gray-700 dark:hover:text-gray-300">Gear</Link>
          </li>
          <li>
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
            {isEditing ? 'Edit' : gear.name}
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        {isEditing ? (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Edit Gear Item
          </h1>
        ) : (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {gear.name}
          </h1>
        )}
        
        {!isEditing && (
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        // Edit form remains the same
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg p-6">
          <form className="space-y-6">
            {/* Form fields remain the same */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`mt-1 block w-full border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`mt-1 block w-full border ${errors.category ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Weight
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className={`flex-1 min-w-0 block w-full border ${errors.weight ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                  />
                  <select
                    id="weightUnit"
                    name="weightUnit"
                    value={formData.weightUnit}
                    onChange={handleInputChange}
                    className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="g">g</option>
                    <option value="oz">oz</option>
                  </select>
                </div>
                {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
              </div>
              
              <div>
                <div className="flex items-center h-full mt-6">
                  <input
                    id="essential"
                    name="essential"
                    type="checkbox"
                    checked={formData.essential}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="essential" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Essential
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Condition
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        // Detail view remains the same
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Gear Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Complete information about your gear item.
              </p>
            </div>
            <div className="flex items-center">
              <span className={`px-2 py-1 text-xs font-medium rounded-full 
                ${gear.condition === 'Excellent' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 
                  gear.condition === 'Good' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 
                  'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                {gear.condition}
              </span>
              {gear.essential && (
                <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  Essential
                </span>
              )}
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700">
            <dl>
              <div className="bg-gray-50 dark:bg-gray-750 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  {gear.name}
                </dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Category
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  {gear.category}
                </dd>
              </div>
              <div className="bg-gray-50 dark:bg-gray-750 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Weight
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                  {gear.weight} {gear.weightUnit || 'g'}
                  {gear.weightUnit === 'g' && gear.weight >= 1000 && (
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                      ({(gear.weight / 1000).toFixed(2)} kg)
                    </span>
                  )}
                  {gear.weightUnit === 'oz' && (
                    <span className="ml-2 text-gray-500 dark:text-gray-400">
                      ({(gear.weight * 28.35).toFixed(0)} g)
                    </span>
                  )}
                </dd>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Notes
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                  {gear.notes || 'No notes provided.'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}