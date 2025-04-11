'use client';

import { useMutation, useQuery, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { getAllTrips, getTripById, createTrip, updateTrip, deleteTrip, TripItem, PackingListItem } from '../api/tripApi';

// Interface for populated gear items from MongoDB
interface PopulatedGearItem {
  _id: string;
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  weight?: number;
  weightUnit?: string;
  price?: number;
  brand?: string;
  [key: string]: string | number | undefined; // Generic index signature for additional properties
}

// Extended packing list item with optional gear object
interface ExtendedPackingListItem extends PackingListItem {
  gear?: PopulatedGearItem;
}

// Extended TripItem with id for frontend use
interface ExtendedTripItem extends TripItem {
  id: string;
  packingList: ExtendedPackingListItem[];
}

// Query keys for caching and invalidation
const QUERY_KEYS = {
  ALL_TRIPS: ['trips'],
  TRIP_DETAIL: (id: string) => ['trips', id],
};

// Helper to normalize MongoDB _id to id for frontend consistency
const normalizeTripItem = (item: TripItem | null): ExtendedTripItem | null => {
  if (!item) return null;
  const { _id, ...rest } = item;
  
  // Also normalize the IDs in the packing list if it exists
  let normalizedPackingList: ExtendedPackingListItem[] = [];
  
  if (rest.packingList?.length) {
    normalizedPackingList = rest.packingList.map(listItem => {
      const newItem = { ...listItem } as ExtendedPackingListItem;
      
      // Cast to unknown first, then check structure
      const extendedItem = listItem as unknown;
      
      // Check if gearId is an object with _id property
      if (
        extendedItem && 
        typeof extendedItem === 'object' &&
        'gearId' in extendedItem && 
        extendedItem.gearId && 
        typeof extendedItem.gearId === 'object' && 
        '_id' in extendedItem.gearId
      ) {
        // If gearId is a populated object with _id, store the object separately 
        // but keep gearId as a string reference
        const gear = extendedItem.gearId as PopulatedGearItem;
        return {
          ...newItem,
          gearId: gear._id, // Ensure gearId is still a string as expected
          gear: {  // Store the full gear object in a separate property
            ...gear,
            id: gear._id,
          }
        };
      }
      return newItem;
    });
  }

  return {
    ...rest,
    packingList: normalizedPackingList,
    _id,
    id: _id || '', // Add the id property that mirrors _id for frontend components
  };
};

const normalizeTripItems = (items: TripItem[] | null): ExtendedTripItem[] => {
  if (!items?.length) return [];
  return items.map(item => normalizeTripItem(item)).filter(Boolean) as ExtendedTripItem[];
};

// Hook for fetching all trips
export function useTripList(options?: Partial<UseQueryOptions<TripItem[], Error, ExtendedTripItem[]>>) {
  return useQuery<TripItem[], Error, ExtendedTripItem[]>({
    queryKey: QUERY_KEYS.ALL_TRIPS,
    queryFn: async () => {
      const items = await getAllTrips();
      return items;
    },
    select: normalizeTripItems,
    ...options
  });
}

// Hook for fetching a single trip
export function useTrip(id: string, options?: Partial<UseQueryOptions<TripItem, Error, ExtendedTripItem | null>>) {
  return useQuery<TripItem, Error, ExtendedTripItem | null>({
    queryKey: QUERY_KEYS.TRIP_DETAIL(id),
    queryFn: async () => {
      const item = await getTripById(id);
      return item;
    },
    select: normalizeTripItem,
    enabled: !!id && (options?.enabled !== false), // Only run if ID exists and not disabled
    ...options
  });
}

// Hook for creating a new trip
export function useCreateTrip(options?: Partial<UseMutationOptions<TripItem, Error, TripItem>>) {
  const queryClient = useQueryClient();
  
  return useMutation<TripItem, Error, TripItem>({
    mutationFn: (newTrip: TripItem) => createTrip(newTrip),
    onSuccess: () => {
      // Invalidate the trip list query to refetch data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_TRIPS });
    },
    ...options
  });
}

// Hook for updating a trip
export function useUpdateTrip(options?: Partial<UseMutationOptions<TripItem, Error, TripItem & { id?: string }>>) {
  const queryClient = useQueryClient();
  
  return useMutation<TripItem, Error, TripItem & { id?: string }>({
    mutationFn: (updatedTrip: TripItem & { id?: string }) => {
      // Make sure we're using _id for the API call
      const apiTrip = { ...updatedTrip };
      if (!apiTrip._id && apiTrip.id) {
        apiTrip._id = apiTrip.id;
      }
      return updateTrip(apiTrip);
    },
    onSuccess: (data) => {
      // Invalidate both the list and the individual item queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_TRIPS });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.TRIP_DETAIL(data._id as string) 
      });
    },
    ...options
  });
}

// Hook for deleting a trip
export function useDeleteTrip(options?: Partial<UseMutationOptions<void, Error, string>>) {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteTrip(id),
    onSuccess: (_data, id) => {
      // Invalidate the trip list query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_TRIPS });
      // Remove the individual item from the cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.TRIP_DETAIL(id) });
    },
    ...options
  });
}