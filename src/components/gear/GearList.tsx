'use client';

import Link from 'next/link';
import { GearItem } from '@/lib/api/gearApi';

interface GearListProps {
  items: Array<GearItem & { id: string }>;
}

export default function GearList({ items }: GearListProps) {
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No gear items found</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by adding some gear to your inventory.
        </p>
        <div className="mt-6">
          <Link 
            href="/gear/add" 
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
            Add New Gear
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {items.map((item) => (
        <li key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
          <Link href={`/gear/${item.id}`} className="block">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                {/* Placeholder image until real images are available */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{item.name}</h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {(item.weight / 1000).toFixed(2)} kg
                  </p>
                </div>
                
                <div className="flex items-center mt-1">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {item.category}
                  </span>
                  
                  {item.essential && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      Essential
                    </span>
                  )}
                  
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full 
                    ${item.condition === 'Excellent' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 
                      item.condition === 'Good' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' : 
                      'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                    {item.condition}
                  </span>
                </div>
                
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.notes}</p>
              </div>
              
              <div className="ml-4">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}