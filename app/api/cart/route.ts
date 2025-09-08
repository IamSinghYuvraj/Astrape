import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import dbConnect from '@/lib/mongodb'
import User, { IUser, ICartItem } from '@/models/User'
import Product from '@/models/Product'
import { Types } from 'mongoose'

interface PopulatedUser extends Omit<IUser, 'cart'> {
  cart: Array<{
    productId: {
      _id: Types.ObjectId
      name: string
      price: number
      imageUrl: string
    }
    quantity: number
  }>
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to view your cart' },
        { status: 401 }
      )
    }

    await dbConnect()

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
      .populate<PopulatedUser>('cart.productId', 'name price imageUrl')
      .exec()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign in again.' },
        { status: 404 }
      )
    }

    // Return the cart items or an empty array if none exist
    return NextResponse.json(user.cart || [])
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Please sign in to add items to cart' },
        { status: 401 }
      )
    }

    const { productId, quantity } = await request.json()

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid product ID or quantity' }, { status: 400 })
    }

    await dbConnect()

    // Verify product exists
    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const user = await User.findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign in again.' },
        { status: 404 }
      )
    }

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(
      (item: ICartItem) => item.productId.toString() === productId
    )

    if (existingItemIndex > -1) {
      // Update quantity
      user.cart[existingItemIndex].quantity = quantity
    } else {
      // Add new item
      user.cart.push({ productId, quantity })
    }

    await user.save()

    return NextResponse.json({ message: 'Item added to cart successfully' })
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 })
  }
}