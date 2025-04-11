import axios from 'axios';

// Gear item type definition
export interface GearItem {
  _id?: string;
  name: string;
  category: string;
  weight: number;
  weightUnit: string;
  essential: boolean;
  image?: string;
  notes?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  createdAt?: Date;
  updatedAt?: Date;
}

// Base API URL
const API_URL = '/api/gear';

// Get all gear items
export const getAllGear = async (): Promise<GearItem[]> => {
  const response = await axios.get(API_URL);
  return response.data.data;
};

// Get a single gear item
export const getGearById = async (id: string): Promise<GearItem> => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data.data;
};

// Create a new gear item
export const createGear = async (gear: GearItem): Promise<GearItem> => {
  const response = await axios.post(API_URL, gear);
  return response.data.data;
};

// Update a gear item
export const updateGear = async (gear: GearItem): Promise<GearItem> => {
  const response = await axios.put(`${API_URL}/${gear._id}`, gear);
  return response.data.data;
};

// Delete a gear item
export const deleteGear = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};