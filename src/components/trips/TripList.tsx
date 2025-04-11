'use client';

import { formatDistance } from 'date-fns';
import Link from 'next/link';
import { TripItem } from '@/lib/api/tripApi';

interface TripListProps {
  items: TripItem[];
}

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

export default function TripList({ items }: TripListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No trips found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by planning a new trip.
        </p>
        <div className="mt-6">
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
            Plan New Trip
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.map((trip) => {
        // Format dates for display
        const startDate = new Date(trip.startDate);
        const endDate = new Date(trip.endDate);
        const formattedStartDate = startDate.toLocaleDateString();
        const formattedEndDate = endDate.toLocaleDateString();
        const duration = formatDistance(endDate, startDate, { addSuffix: false });
        
        return (
          <li key={trip._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
            <Link href={`/trips/${trip._id}`} className="block">
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {trip.name}
                    </h3>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getTripStatusColor(trip.status)}`}>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {trip.location || 'No location specified'}
                  </p>
                  
                  {trip.description && (
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                </div>
                <div className="mt-2 sm:mt-0 text-right flex flex-col items-end">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formattedStartDate} - {formattedEndDate}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {duration}
                  </p>
                  
                  {trip.packingList && trip.packingList.length > 0 && (
                    <div className="mt-1 flex items-center">
                      <svg className="h-4 w-4 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {trip.packingList.filter(item => item.isPacked).length} / {trip.packingList.length} packed
                      </span>
                    </div>
                  )}
                  
                  {trip.totalWeight && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {(trip.totalWeight / 1000).toFixed(2)} kg total
                    </p>
                  )}
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}