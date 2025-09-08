'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, ShoppingBag, CreditCard, Shield } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

interface CartItem {
  productId: {
    _id: string
    name: string
    description: string
    price: number
    category: string
    imageUrl: string
  }
  quantity: number
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent('/cart')}`)
      return
    }

    fetchCartItems()
  }, [session, status, router])

  const fetchCartItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cart', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch cart')
      }
      
      const data = await response.json()
      setCartItems(data || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const removeFromCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove item from cart')
      }

      await fetchCartItems()
      toast.success('Item removed from cart')
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
    }
  }

  if (loading && status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }
  
  const total = cartItems.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0)
  const tax = total * 0.1 // 10% tax
  const shipping = total > 8000 ? 0 : 800 // Free shipping over ₹8000
  const finalTotal = total + tax + shipping

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Your cart is empty</h2>
            <p className="mt-4 text-lg text-gray-600">
              Start shopping to add items to your cart
            </p>
            <div className="mt-8">
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.productId._id}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.productId.imageUrl}
                          alt={item.productId.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.productId.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.productId.description}
                        </p>
                        <p className="text-sm text-gray-500 mt-2 capitalize">
                          Category: {item.productId.category}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        {/* Price */}
                        <div className="text-right min-w-0 flex-shrink-0">
                          <p className="text-lg font-semibold text-gray-900">
                            ₹{(item.productId.price * item.quantity * 80).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₹{(item.productId.price * 80).toFixed(2)} each
                          </p>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.productId._id)}
                          className="text-red-600 hover:text-red-800 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{(total * 80).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₹{(tax * 80).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `₹${(shipping * 80).toFixed(2)}`}
                    </span>
                  </div>
                  {total < 8000 && (
                    <p className="text-xs text-gray-500">
                      Free shipping on orders over ₹8000
                    </p>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-lg font-semibold">
                        ₹{(finalTotal * 80).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Proceed to Checkout
                </Button>

                <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                  <Shield className="mr-1 h-4 w-4" />
                  Secure checkout
                </div>

                <div className="mt-4 text-center">
                  <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                    ← Continue Shopping
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
