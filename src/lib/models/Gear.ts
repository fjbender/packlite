import mongoose, { Schema, Document } from 'mongoose';

export interface IGear extends Document {
  userId: string;
  name: string;
  category: string;
  weight: number;
  weightUnit: string;
  essential: boolean;
  image?: string;
  notes?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  createdAt: Date;
  updatedAt: Date;
}

const GearSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    weight: { type: Number, required: true },
    weightUnit: { type: String, required: true, enum: ['g', 'oz'], default: 'g' },
    essential: { type: Boolean, default: false },
    image: { type: String },
    notes: { type: String },
    condition: { 
      type: String, 
      required: true, 
      enum: ['Excellent', 'Good', 'Fair', 'Poor'],
      default: 'Good'
    }
  },
  { timestamps: true }
);

// Create a compound index on userId and category for faster queries
GearSchema.index({ userId: 1, category: 1 });

// Convert weight to grams if stored in ounces for consistency
//GearSchema.virtual('weightInGrams').get(function() {
//  return this.weightUnit === 'oz' ? this.weight * 28.3495 : this.weight;
//});

export default mongoose.models.Gear || mongoose.model<IGear>('Gear', GearSchema);