'use client';

import { ShoppingBag, User, LogOut, Store, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface User {
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export default function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItemsCount, setCartItemsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const cart = await response.json()
      const count = Array.isArray(cart) 
        ? cart.reduce((total: number, item: any) => total + (item.quantity || 0), 0)
        : 0
        
      setCartItemsCount(count);
      return count;
    } catch (error) {
      console.error('Error fetching cart count:', error)
      setError('Failed to load cart')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    } else {
      setCartItemsCount(0);
    }
  }, [isAuthenticated, fetchCartCount]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Astrape store</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link href="/cart" className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="relative"
                    disabled={isLoading}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {(cartItemsCount > 0 || isLoading) && (
                      <span className={`absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                        isLoading ? 'bg-gray-400' : 'bg-blue-600 text-white'
                      }`}>
                        {isLoading ? '...' : cartItemsCount}
                      </span>
                    )}
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5 text-sm text-gray-700">
                      <div className="font-medium">{user?.email || 'User'}</div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={(e) => {
                      e.preventDefault();
                      signOut();
                    }}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Sign up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
