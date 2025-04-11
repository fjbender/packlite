'use client';

import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { getAllGear, getGearById, createGear, updateGear, deleteGear, GearItem } from '../api/gearApi';

// Query keys for caching and invalidation
const QUERY_KEYS = {
  ALL_GEAR: ['gear'],
  GEAR_DETAIL: (id: string) => ['gear', id],
};

// Helper to normalize MongoDB _id to id for frontend consistency
const normalizeGearItem = (item: GearItem | null): (GearItem & { id: string }) | null => {
  if (!item) return null;
  const { _id, ...rest } = item;
  return {
    ...rest,
    _id, 
    id: _id || '', // Ensure id is always a string, even if _id is undefined
  };
};

const normalizeGearItems = (items: GearItem[]): Array<GearItem & { id: string }> => {
  if (!items?.length) return [];
  return items.map(item => normalizeGearItem(item)).filter(Boolean) as Array<GearItem & { id: string }>;
};

// Hook for fetching all gear
export function useGearList(options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: QUERY_KEYS.ALL_GEAR,
    queryFn: async () => {
      const items = await getAllGear();
      return normalizeGearItems(items);
    },
    ...options
  });
}

// Hook for fetching a single gear item
export function useGearItem(id: string, options?: Partial<UseQueryOptions>) {
  return useQuery({
    queryKey: QUERY_KEYS.GEAR_DETAIL(id),
    queryFn: async () => {
      const item = await getGearById(id);
      return normalizeGearItem(item);
    },
    enabled: !!id && (options?.enabled !== false), // Only run if ID exists and not disabled
    ...options
  });
}

// Hook for creating a new gear item
export function useCreateGear() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newGear: GearItem) => createGear(newGear),
    onSuccess: () => {
      // Invalidate the gear list query to refetch data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_GEAR });
    },
  });
}

// Hook for updating a gear item
export function useUpdateGear() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (updatedGear: GearItem & { id?: string }) => {
      // Make sure we're using _id for the API call
      const apiGear = { ...updatedGear };
      if (!apiGear._id && apiGear.id) {
        apiGear._id = apiGear.id;
      }
      return updateGear(apiGear);
    },
    onSuccess: (data) => {
      // Invalidate both the list and the individual item queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_GEAR });
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.GEAR_DETAIL(data._id as string) 
      });
    },
  });
}

// Hook for deleting a gear item
export function useDeleteGear() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteGear(id),
    onSuccess: (_data, id) => {
      // Invalidate the gear list query
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ALL_GEAR });
      // Remove the individual item from the cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.GEAR_DETAIL(id) });
    },
  });
}