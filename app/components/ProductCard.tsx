'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ShoppingCart, Heart } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: session } = useSession()
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!session) {
      toast.error('Please sign in to add items to cart')
      return
    }

    setIsAddingToCart(true)
    
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to cart')
      }

      toast.success('Item added to cart!')
    } catch (error) {
      toast.error('Failed to add item to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="aspect-square relative overflow-hidden bg-gray-50">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
              {product.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              ₹{(product.price * 80).toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
              {product.category}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isAddingToCart ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
}