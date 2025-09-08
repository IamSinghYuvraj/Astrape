import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
}

const ProductSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  imageUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)