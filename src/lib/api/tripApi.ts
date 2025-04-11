import axios from 'axios';

// Trip item type definition
export interface TripItem {
  _id?: string;
  name: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  location?: string;
  distance?: number;
  distanceUnit: string;
  packingList: PackingListItem[];
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  totalWeight?: number;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Packing list item interface
export interface PackingListItem {
  gearId: string;
  isPacked: boolean;
  quantity: number;
}

// Base API URL
const API_URL = '/api/trips';

// Get all trips
export const getAllTrips = async (): Promise<TripItem[]> => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

// Get a single trip
export const getTripById = async (id: string): Promise<TripItem> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
};

// Create a new trip
export const createTrip = async (trip: TripItem): Promise<TripItem> => {
  const response = await axios.post(API_URL, trip);
  return response.data.data;
};

// Update a trip
export const updateTrip = async (trip: TripItem): Promise<TripItem> => {
  const response = await axios.put(`${API_URL}/${trip._id}`, trip);
  return response.data.data;
};

// Delete a trip
export const deleteTrip = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};