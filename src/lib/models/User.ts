import mongoose, { Schema } from "mongoose"

export interface IUser {
  _id: string
  name: string
  email: string
  password?: string
  image?: string
  emailVerified?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    emailVerified: { type: Date }
  },
  { timestamps: true }
)

// Use mongoose.models to check if the model exists already to prevent overwriting
export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)