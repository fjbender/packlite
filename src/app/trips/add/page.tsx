'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTrip } from '@/lib/hooks/useTrip';
import { useGearList } from '@/lib/hooks/useGear';
import { GearItem } from '@/lib/api/gearApi';
import Link from 'next/link';

// Type for the normalized gear item with both _id and id
type NormalizedGearItem = GearItem & { id: string };

// Import Trip types
type TripStatus = 'planned' | 'in-progress' | 'completed' | 'cancelled';

/*
interface TripItem {
  name: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  location?: string;
  distance?: number;
  distanceUnit: string;
  packingList: Array<{ gearId: string; isPacked: boolean; quantity: number }>;
  status: TripStatus;
  notes?: string;
  totalWeight?: number;
  isPublic: boolean;
}*/

export default function AddTripPage() {
  const router = useRouter();
  const { mutateAsync: createTrip, isPending } = useCreateTrip();
  const { data: gear = [] } = useGearList() as { data: NormalizedGearItem[] };
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    distance: '',
    distanceUnit: 'mi', // Default to miles
    status: 'planned' as TripStatus, // Default to planned
    notes: '',
    isPublic: false,
    packingList: [] as Array<{ gearId: string; isPacked: boolean; quantity: number; }>
  });

  const [selectedGear, setSelectedGear] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Build packing list from selected gear
        const packingList = selectedGear.map(gearId => ({
          gearId,
          isPacked: false,
          quantity: 1
        }));
        
        // Calculate total weight based on selected gear
        const totalWeight = gear
          .filter(item => selectedGear.includes(item.id))
          .reduce((sum, item) => {
            // Convert to grams for consistency if needed
            const weightInGrams = item.weightUnit === 'oz' 
              ? item.weight * 28.35 
              : item.weight;
            return sum + weightInGrams;
          }, 0);
        
        // Prepare trip data for submission
        const tripData = {
          ...formData,
          packingList,
          totalWeight,
          distance: formData.distance ? Number(formData.distance) : undefined
        };
        
        await createTrip(tripData);
        router.push('/trips');
      } catch (error) {
        console.error('Error creating trip:', error);
        setErrors({ form: 'Failed to create trip. Please try again.' });
      }
    }
  };

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
          <li className="font-medium text-gray-900 dark:text-gray-100">
            New Trip
          </li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Plan a New Trip
      </h1>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Trip Details</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Basic information about your trip.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
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
                    placeholder="e.g., Appalachian Trail, Georgia to Maine"
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
                      placeholder="e.g., 25"
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
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Packing List</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select gear for this trip.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              {gear.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No gear items found. Add gear to your inventory first.
                  </p>
                  <div className="mt-4">
                    <Link 
                      href="/gear/add" 
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Gear
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                    Selected items: {selectedGear.length} / {gear.length}
                  </p>
                  
                  <fieldset>
                    <legend className="sr-only">Gear Items</legend>
                    <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
                      {gear.map((item) => (
                        <div key={item.id} className="relative flex items-start py-2 border-b border-gray-200 dark:border-gray-700">
                          <div className="min-w-0 flex-1 text-sm">
                            <label htmlFor={`gear-${item.id}`} className="font-medium text-gray-700 dark:text-gray-300">
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
                              id={`gear-${item.id}`}
                              name={`gear-${item.id}`}
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
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Notes</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Any additional information for this trip.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={formData.notes}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Weather considerations, special requirements, etc."
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link 
            href="/trips" 
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 mr-3"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? 'Creating...' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
}