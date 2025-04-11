'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import GearList from '../../components/gear/GearList';
import GearFilters from '../../components/gear/GearFilters';
import { useGearList } from '../../lib/hooks/useGear';
import { GearItem } from '../../lib/api/gearApi';

// Define categories for gear items
const categories = [
  'All',
  'Packs',
  'Shelter',
  'Sleep System',
  'Cooking',
  'Water',
  'Clothing',
  'Essentials',
  'Electronics',
  'First Aid',
  'Miscellaneous',
];

export default function GearPage() {
  const { data: session, status } = useSession();
  const isAuthenticated = !!session;
  const isLoading = status === 'loading';

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'weight', 'category'

  // Fetch gear items from API
  const { 
    data: gearItems, 
    isLoading: isLoadingGear, 
    error 
  } = useGearList({
    enabled: isAuthenticated // Only fetch gear if user is authenticated
  });
  
  // Apply type assertion to gearItems
  const typedGearItems = (gearItems || []) as Array<GearItem & { id: string }>;

  // Filter and sort gear items
  const filteredGear = typedGearItems
    .filter((item) => 
      (selectedCategory === 'All' || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'weight') return a.weight - b.weight;
      if (sortBy === 'category') return a.category.localeCompare(b.category);
      return 0;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Manage Your Gear</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to manage your gear.
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Gear</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your hiking and trekking equipment
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link 
            href="/gear/add" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Gear
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md mb-6">
          <p className="text-red-800 dark:text-red-200">
            Error loading gear items. Please try again later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Side filters and statistics */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
              <GearFilters 
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </div>

          {/* Main content - gear list */}
          <div className="lg:col-span-9">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
              {isLoadingGear ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <GearList items={filteredGear} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}