'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTripList } from '@/lib/hooks/useTrip';
import TripList from '@/components/trips/TripList';
import Link from 'next/link';
import { TripItem } from '@/lib/api/tripApi';

// Define the type for normalized trip items that include the id field
type NormalizedTripItem = TripItem & { id: string };

export default function TripsPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
  const isLoading = status === 'loading';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { 
    data: trips = [], 
    isLoading: isLoadingTrips, 
    error 
  } = useTripList({
    enabled: isAuthenticated // Only fetch trips if user is authenticated
  }) as { data: NormalizedTripItem[], isLoading: boolean, error: unknown };
  
  // Filter trips based on search term and status
  const filteredTrips = trips.filter((trip: NormalizedTripItem) => {
    const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (trip.location && trip.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (trip.description && trip.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // If session is loading, show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center p-8 bg-white dark:bg-gray-800 shadow rounded-lg">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Plan Your Trips</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to manage your trips.
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header with title and add button */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Trips</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Plan and manage your hiking and trekking adventures
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link 
            href="/trips/add" 
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg 
              className="-ml-1 mr-2 h-5 w-5" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            New Trip
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 bg-white dark:bg-gray-800 shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <div className="max-w-lg flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg 
                    className="h-5 w-5 text-gray-400" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    aria-hidden="true"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Search trips by name, location, or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0 md:ml-4">
            <select
              id="status"
              name="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trip List */}
      <div className="mt-6 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {isLoadingTrips ? (
          <div className="p-4 animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
                <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-red-600 dark:text-red-400">
            Error loading trips. Please try again later.
          </div>
        ) : (
          <TripList items={filteredTrips} />
        )}
      </div>
    </div>
  );
}