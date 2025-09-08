import mongoose, { Document, Schema, Types } from 'mongoose'

export interface ICartItem {
  productId: Types.ObjectId | {
    _id: Types.ObjectId
    name: string
    price: number
    imageUrl: string
  }
  quantity: number
}

export interface IUser extends Document {
  name: string
  email: string
  password: string
  cart: ICartItem[]
  createdAt: Date
  updatedAt: Date
}

const CartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
})

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  cart: [CartItemSchema]
}, {
  timestamps: true
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)