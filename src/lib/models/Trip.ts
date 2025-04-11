import mongoose, { Schema, Document } from 'mongoose';

// Interface for a gear item within a packing list
interface IPackingListItem {
  gearId: mongoose.Types.ObjectId | string;
  isPacked: boolean;
  quantity: number;
}

// Interface for the Trip document
export interface ITrip extends Document {
  userId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  distance?: number;
  distanceUnit: string;
  packingList: IPackingListItem[];
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  totalWeight?: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for a packing list item
const PackingListItemSchema = new Schema({
  gearId: { type: Schema.Types.ObjectId, ref: 'Gear', required: true },
  isPacked: { type: Boolean, default: false },
  quantity: { type: Number, default: 1, min: 1 }
});

// Main Trip schema
const TripSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String },
    distance: { type: Number },
    distanceUnit: { type: String, enum: ['mi', 'km'], default: 'mi' },
    packingList: [PackingListItemSchema],
    status: { 
      type: String, 
      required: true, 
      enum: ['planned', 'in-progress', 'completed', 'cancelled'],
      default: 'planned'
    },
    notes: { type: String },
    totalWeight: { type: Number },
    isPublic: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Create indexes for common queries
TripSchema.index({ userId: 1, status: 1 });
TripSchema.index({ userId: 1, startDate: -1 });
TripSchema.index({ isPublic: 1, status: 1 }, { sparse: true });

// Virtual for the number of items in the packing list
TripSchema.virtual('itemCount').get(function() {
  return Array.isArray(this.packingList) ? this.packingList.reduce((sum: number, item: IPackingListItem) => sum + item.quantity, 0) : 0;
});

export default mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);