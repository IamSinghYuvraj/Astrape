import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    let filter: any = {}

    if (category) {
      filter.category = category
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }

    const products = await Product.find(filter).sort({ createdAt: -1 })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST() {
  try {
    await dbConnect()

    // Check if products already exist
    const existingProducts = await Product.countDocuments()
    if (existingProducts > 0) {
      return NextResponse.json({ message: 'Products already seeded' }, { status: 200 })
    }

    const sampleProducts = [
      {
        name: 'Premium Wireless Headphones',
        description: 'High-quality noise-canceling wireless headphones with premium sound.',
        price: 299.99,
        category: 'electronics',
        imageUrl: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'
      },
      {
        name: 'Minimalist Leather Wallet',
        description: 'Handcrafted genuine leather wallet with RFID protection.',
        price: 89.99,
        category: 'accessories',
        imageUrl: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Sustainable, soft organic cotton t-shirt in various colors.',
        price: 45.00,
        category: 'clothing',
        imageUrl: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'
      },
      {
        name: 'Smart Fitness Tracker',
        description: 'Advanced fitness tracking with heart rate monitoring and GPS.',
        price: 199.99,
        category: 'electronics',
        imageUrl: 'https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg'
      },
      {
        name: 'Ceramic Coffee Mug',
        description: 'Handmade ceramic mug perfect for your morning coffee ritual.',
        price: 24.99,
        category: 'home',
        imageUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg'
      },
      {
        name: 'Designer Sunglasses',
        description: 'UV protection sunglasses with premium polarized lenses.',
        price: 159.99,
        category: 'accessories',
        imageUrl: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg'
      },
      {
        name: 'Wool Blend Sweater',
        description: 'Cozy wool blend sweater perfect for cool weather.',
        price: 120.00,
        category: 'clothing',
        imageUrl: 'https://images.pexels.com/photos/1240892/pexels-photo-1240892.jpeg'
      },
      {
        name: 'Bluetooth Speaker',
        description: 'Portable waterproof Bluetooth speaker with premium sound quality.',
        price: 79.99,
        category: 'electronics',
        imageUrl: 'https://images.pexels.com/photos/1440727/pexels-photo-1440727.jpeg'
      },
      {
        name: 'Stainless Steel Water Bottle',
        description: 'Insulated water bottle that keeps drinks cold for 24 hours.',
        price: 34.99,
        category: 'accessories',
        imageUrl: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg'
      },
      {
        name: 'Ergonomic Office Chair',
        description: 'Comfortable office chair with lumbar support and adjustable height.',
        price: 299.99,
        category: 'furniture',
        imageUrl: 'https://images.pexels.com/photos/1957477/pexels-photo-1957477.jpeg'
      }
    ]

    await Product.insertMany(sampleProducts)

    return NextResponse.json({ message: 'Products seeded successfully' }, { status: 201 })
  } catch (error) {
    console.error('Error seeding products:', error)
    return NextResponse.json({ error: 'Failed to seed products' }, { status: 500 })
  }
}