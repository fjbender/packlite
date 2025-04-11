'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTrip, useUpdateTrip, useDeleteTrip } from '@/lib/hooks/useTrip';
import { useGearList } from '@/lib/hooks/useGear';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import GearCategoryStats from '@/components/gear/GearCategoryStats';
import { TripItem, PackingListItem } from '@/lib/api/tripApi';
import { GearItem } from '@/lib/api/gearApi';

// Extended gear item type that includes the id property added by normalizeGearItem in useGear.ts
type ExtendedGearItem = GearItem & { id: string };

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = !!session;
  const isAuthLoading = authStatus === 'loading';
  
  const { 
    data: tripData, 
    isLoading: tripLoading, 
    error: tripError 
  } = useTrip(id, {
    enabled: isAuthenticated // Only fetch trip if user is authenticated
  });
  
  // Type assertion to properly type the trip data
  const trip = tripData as TripItem;
  
  const { 
    data: allGearData = [], 
    isLoading: gearLoading 
  } = useGearList({
    enabled: isAuthenticated // Only fetch gear if user is authenticated
  });
  
  // Type assertion for gear data with the extended type that includes 'id'
  const allGear = allGearData as ExtendedGearItem[];
  
  const updateTripMutation = useUpdateTrip();
  const deleteTripMutation = useDeleteTrip();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showAddGear, setShowAddGear] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    distance: '',
    distanceUnit: 'mi' as 'mi' | 'km',
    status: 'planned' as 'planned' | 'in-progress' | 'completed' | 'cancelled',
    notes: '',
    isPublic: false
  });
  const [packingList, setPackingList] = useState<PackingListItem[]>([]);
  const [availableGear, setAvailableGear] = useState<ExtendedGearItem[]>([]);
  const [selectedGear, setSelectedGear] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Define updateAvailableGear before using it in useEffect
  const updateAvailableGear = useCallback((currentPackingList: PackingListItem[]) => {
    const packedGearIds = currentPackingList.map(item => item.gearId);
    const available = allGear.filter(gear => !packedGearIds.includes(gear.id));
    setAvailableGear(available);
  }, [allGear]);

  // Initialize form data when trip is loaded
  useEffect(() => {
    if (trip) {
      setFormData({
        name: trip.name,
        description: trip.description || '',
        startDate: new Date(trip.startDate).toISOString().split('T')[0],
        endDate: new Date(trip.endDate).toISOString().split('T')[0],
        location: trip.location || '',
        distance: trip.distance ? trip.distance.toString() : '',
        distanceUnit: trip.distanceUnit as 'mi' | 'km',
        status: trip.status,
        notes: trip.notes || '',
        isPublic: trip.isPublic
      });
      
      setPackingList(trip.packingList || []);
      
      // Calculate available gear (gear not in the packing list)
      updateAvailableGear(trip.packingList || []);
    }
  }, [trip, allGear, updateAvailableGear]);

  // Calculate category weights for the pie chart
  const categoryWeights = useMemo(() => {
    if (!allGear.length || !packingList.length) return {};
    
    // Get unique categories from the gear in the packing list
    const categories = Array.from(new Set(
      packingList
        .map(item => {
          const gear = allGear.find(g => g.id === item.gearId);
          return gear ? gear.category : null;
        })
        .filter(Boolean)
    )) as string[];
    
    // Calculate weight by category
    return categories.reduce((acc, category) => {
      const totalWeight = packingList.reduce((sum, item) => {
        const gear = allGear.find(g => g.id === item.gearId);
        if (!gear || gear.category !== category) return sum;
        
        // Convert to grams for consistency
        const weightInGrams = gear.weightUnit === 'oz' 
          ? gear.weight * 28.35 
          : gear.weight;
        
        return sum + (weightInGrams * item.quantity);
      }, 0);
      
      return { ...acc, [category]: totalWeight };
    }, {} as Record<string, number>);
  }, [allGear, packingList]);

  // Rest of the helper functions remain the same
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleGearSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setSelectedGear(prev => [...prev, value]);
    } else {
      setSelectedGear(prev => prev.filter(id => id !== value));
    }
  };

  const handlePackingItemToggle = async (gearId: string) => {
    if (!trip) return;
    
    const updatedPackingList = packingList.map(item => 
      item.gearId === gearId ? { ...item, isPacked: !item.isPacked } : item
    );
    
    setPackingList(updatedPackingList);
    
    // Update trip with the new packing list
    try {
      await updateTripMutation.mutateAsync({
        ...trip,
        packingList: updatedPackingList
      });
    } catch (error) {
      console.error('Error updating packing list:', error);
    }
  };

  const handlePackingItemDelete = async (gearId: string) => {
    if (!trip) return;
    
    const updatedPackingList = packingList.filter(item => item.gearId !== gearId);
    
    setPackingList(updatedPackingList);
    updateAvailableGear(updatedPackingList);
    
    // Update trip with the new packing list
    try {
      const updatedTrip = {
        ...trip,
        packingList: updatedPackingList,
        totalWeight: calculateTotalWeight(updatedPackingList)
      };
      
      await updateTripMutation.mutateAsync(updatedTrip);
    } catch (error) {
      console.error('Error updating packing list:', error);
    }
  };

  const handleQuantityChange = async (gearId: string, quantity: number) => {
    if (!trip || quantity < 1) return;
    
    const updatedPackingList = packingList.map(item => 
      item.gearId === gearId ? { ...item, quantity } : item
    );
    
    setPackingList(updatedPackingList);
    
    // Update trip with the new packing list
    try {
      const updatedTrip = {
        ...trip,
        packingList: updatedPackingList,
        totalWeight: calculateTotalWeight(updatedPackingList)
      };
      
      await updateTripMutation.mutateAsync(updatedTrip);
    } catch (error) {
      console.error('Error updating packing list:', error);
    }
  };

  const handleAddGear = async () => {
    if (!trip || selectedGear.length === 0) return;
    
    // Add selected gear to the packing list
    const newItems = selectedGear.map(gearId => ({
      gearId,
      isPacked: false,
      quantity: 1
    }));
    
    const updatedPackingList = [...packingList, ...newItems];
    
    setPackingList(updatedPackingList);
    updateAvailableGear(updatedPackingList);
    setSelectedGear([]);
    setShowAddGear(false);
    
    // Update trip with the new packing list
    try {
      const updatedTrip = {
        ...trip,
        packingList: updatedPackingList,
        totalWeight: calculateTotalWeight(updatedPackingList)
      };
      
      await updateTripMutation.mutateAsync(updatedTrip);
    } catch (error) {
      console.error('Error updating packing list:', error);
    }
  };

  const calculateTotalWeight = (currentPackingList: Array<{ gearId: string; quantity: number }>) => {
    return currentPackingList.reduce((total, item) => {
      const gearItem = allGear.find(gear => gear.id === item.gearId);
      if (!gearItem) return total;
      
      // Convert to grams for consistency if needed
      const weightInGrams = gearItem.weightUnit === 'oz' 
        ? gearItem.weight * 28.35 
        : gearItem.weight;
      
      return total + (weightInGrams * item.quantity);
    }, 0);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    if (formData.distance && (isNaN(Number(formData.distance)) || Number(formData.distance) <= 0)) {
      newErrors.distance = 'Distance must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!trip || !validateForm()) return;
    
    try {
      const updatedTrip = {
        ...trip,
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        distance: formData.distance ? Number(formData.distance) : undefined,
        distanceUnit: formData.distanceUnit,
        status: formData.status,
        notes: formData.notes,
        isPublic: formData.isPublic,
      };
      
      await updateTripMutation.mutateAsync(updatedTrip);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating trip:', error);
      setErrors({ form: 'Failed to update trip. Please try again.' });
    }
  };

  const handleDelete = async () => {
    if (!trip || !confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return;
    
    try {
      await deleteTripMutation.mutateAsync(id);
      router.push('/trips');
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  const getTripStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const renderGearItem = (gearId: string, isPacked: boolean, quantity: number) => {
    const gear = allGear.find(g => g.id === gearId);
    if (!gear) return null;
    
    return (
      <li key={gearId} className="py-3 flex items-center justify-between">
        <div className="flex items-center">
          <input
            id={`gear-${gearId}`}
            name={`gear-${gearId}`}
            type="checkbox"
            checked={isPacked}
            onChange={() => handlePackingItemToggle(gearId)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:border-gray-700"
          />
          <label 
            htmlFor={`gear-${gearId}`} 
            className={`ml-3 block text-sm font-medium ${isPacked ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}
          >
            {gear.name}
            <div className="flex items-center mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {gear.category}
              </span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                {gear.weight} {gear.weightUnit || 'g'}
              </span>
              {gear.essential && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  Essential
                </span>
              )}
            </div>
          </label>
        </div>
        
        <div className="flex items-center">
          <div className="mr-4 flex items-center">
            <button
              type="button"
              onClick={() => handleQuantityChange(gearId, Math.max(1, quantity - 1))}
              className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="mx-2 text-sm text-gray-700 dark:text-gray-300">{quantity}</span>
            <button
              type="button"
              onClick={() => handleQuantityChange(gearId, quantity + 1)}
              className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 6V12m0 0h6m-6 0H6" />
              </svg>
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => handlePackingItemDelete(gearId)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </li>
    );
  };

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">View Trip Details</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to view trip details.
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

  if (tripLoading || gearLoading) {
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

  if (tripError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">
                Error loading trip. Please try again later.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Link 
            href="/trips" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-yellow-50 dark:bg-yellow-900 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                Trip not found.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Link 
            href="/trips" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Trips
          </Link>
        </div>
      </div>
    );
  }

  // Format dates for display
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const formattedStartDate = startDate.toLocaleDateString();
  const formattedEndDate = endDate.toLocaleDateString();
  const duration = formatDistance(endDate, startDate, { addSuffix: false });
  
  // Calculate packing progress
  const packedItems = packingList.filter(item => item.isPacked).length;
  const totalItems = packingList.length;
  const packingProgress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

  // Rest of the component remains the same
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <li>
            <Link href="/trips" className="hover:text-gray-700 dark:hover:text-gray-300">Trips</Link>
          </li>
          <li>
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-xs">
            {isEditing ? 'Edit' : trip.name}
          </li>
        </ol>
      </nav>

      {errors.form && (
        <div className="mb-6 bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">
                {errors.form}
              </p>
            </div>
          </div>
        </div>
      )}

      {isEditing ? (
        /* Trip Edit Form */
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              Edit Trip
            </h3>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:px-6">
            <form className="space-y-6">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trip Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.name ? 'border-red-300' : ''}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="col-span-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  ></textarea>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.startDate ? 'border-red-300' : ''}`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.endDate ? 'border-red-300' : ''}`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="distance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Distance
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="distance"
                      id="distance"
                      value={formData.distance}
                      onChange={handleInputChange}
                      className={`focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.distance ? 'border-red-300' : ''}`}
                    />
                    <select
                      id="distanceUnit"
                      name="distanceUnit"
                      value={formData.distanceUnit}
                      onChange={handleInputChange}
                      className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    >
                      <option value="mi">mi</option>
                      <option value="km">km</option>
                    </select>
                  </div>
                  {errors.distance && (
                    <p className="mt-1 text-sm text-red-600">{errors.distance}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  ></textarea>
                </div>

                <div className="col-span-6">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="isPublic"
                        name="isPublic"
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={handleInputChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:border-gray-700"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="isPublic" className="font-medium text-gray-700 dark:text-gray-300">Make trip public</label>
                      <p className="text-gray-500 dark:text-gray-400">Share your trip and packing list with the community.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateTripMutation.isPending}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {updateTripMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Trip Detail View */
        <>
          {/* Trip Header */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  {trip.name}
                  <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getTripStatusColor(trip.status)}`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('-', ' ')}
                  </span>
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  {formattedStartDate} - {formattedEndDate} ({duration})
                </p>
              </div>
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
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <dl>
                {trip.description && (
                  <div className="bg-gray-50 dark:bg-gray-750 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Description
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                      {trip.description}
                    </dd>
                  </div>
                )}
                
                <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                    {trip.location || 'No location specified'}
                  </dd>
                </div>
                
                {trip.distance && (
                  <div className="bg-gray-50 dark:bg-gray-750 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Distance
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2">
                      {trip.distance} {trip.distanceUnit}
                      {trip.distanceUnit === 'mi' && (
                        <span className="ml-2 text-gray-500 dark:text-gray-400">
                          (approx. {(trip.distance * 1.60934).toFixed(1)} km)
                        </span>
                      )}
                      {trip.distanceUnit === 'km' && (
                        <span className="ml-2 text-gray-500 dark:text-gray-400">
                          (approx. {(trip.distance * 0.621371).toFixed(1)} mi)
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                
                {trip.notes && (
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Notes
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                      {trip.notes}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Packing List */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                  Packing List
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  {packedItems} of {totalItems} items packed
                  {trip.totalWeight && (
                    <span className="ml-2">· {(trip.totalWeight / 1000).toFixed(2)} kg total</span>
                  )}
                </p>
              </div>
              <div>
                {!showAddGear && (
                  <button
                    type="button"
                    onClick={() => setShowAddGear(true)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg 
                      className="h-4 w-4 mr-1" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Gear
                  </button>
                )}
              </div>
            </div>
            
            {/* Packing Progress Bar */}
            {totalItems > 0 && (
              <div className="px-4 py-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${packingProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
                  {packingProgress}% packed
                </p>
              </div>
            )}
            
            {/* Add Gear Form */}
            {showAddGear && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add gear to your packing list</h4>
                
                {availableGear.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      All your gear has been added to this trip.
                    </p>
                    {allGear.length === 0 && (
                      <div className="mt-4">
                        <Link 
                          href="/gear/add" 
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Add New Gear
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="max-h-64 overflow-y-auto pr-2 mb-4">
                      <fieldset>
                        <legend className="sr-only">Gear Items</legend>
                        <div className="space-y-2">
                          {availableGear.map((item) => (
                            <div key={item.id} className="relative flex items-start py-2 border-b border-gray-200 dark:border-gray-700">
                              <div className="min-w-0 flex-1 text-sm">
                                <label htmlFor={`add-gear-${item.id}`} className="font-medium text-gray-700 dark:text-gray-300">
                                  {item.name}
                                </label>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                    {item.category}
                                  </span>
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    {item.weight} {item.weightUnit || 'g'}
                                  </span>
                                  {item.essential && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                      Essential
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="ml-3 flex items-center h-5">
                                <input
                                  id={`add-gear-${item.id}`}
                                  name={`add-gear-${item.id}`}
                                  value={item.id}
                                  type="checkbox"
                                  checked={selectedGear.includes(item.id)}
                                  onChange={handleGearSelection}
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded dark:border-gray-700"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddGear(false);
                          setSelectedGear([]);
                        }}
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddGear}
                        disabled={selectedGear.length === 0}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        Add Selected ({selectedGear.length})
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Packing List Items */}
            <div className="border-t border-gray-200 dark:border-gray-700">
              {totalItems === 0 ? (
                <div className="text-center py-8">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12 mx-auto text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                    />
                  </svg>
                  <h4 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No gear added yet</h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Start adding gear to your packing list.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 px-4 py-4">
                  {packingList.map(item => renderGearItem(item.gearId, item.isPacked, item.quantity))}
                </ul>
              )}
            </div>
          </div>

          {/* Weight Distribution */}
          {Object.keys(categoryWeights).length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                  Weight Distribution by Category
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  How your gear weight is distributed across categories
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5">
                <GearCategoryStats categoryWeights={categoryWeights} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}