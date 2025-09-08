import { Types } from 'mongoose'

export interface ICartItem {
  productId: Types.ObjectId | {
    _id: Types.ObjectId
    name: string
    price: number
    imageUrl: string
  }
  quantity: number
}

export interface IUserCart {
  _id: Types.ObjectId
  cart: ICartItem[]
}
