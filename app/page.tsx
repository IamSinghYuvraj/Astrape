'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import ProductCard from '@/app/components/ProductCard'
import FilterSidebar from '@/app/components/FilterSidebar'
import { toast } from 'sonner'
import { Loader2, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('newest')
  const { data: session } = useSession()

  const INR_CONVERSION_RATE = 80; // Assuming 1 USD = 80 INR

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')

      const data: Product[] = await response.json()

      setProducts(data)
      setFilteredProducts(data)
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.map((p: Product) => p.category)))
      setCategories(uniqueCategories)
      
      // Find max price
      const prices = data.map((p: Product) => p.price)
      setMaxPrice(Math.max(...prices) * INR_CONVERSION_RATE)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Seed products on first load
  useEffect(() => {
    fetch('/api/products', { method: 'POST' })
      .then(() => fetchProducts())
      .catch(console.error)
  }, [])

  const handleFiltersChange = (filters: {
    category: string[]
    priceRange: [number, number]
  }) => {
    let filtered = products

    // Filter by category
    if (filters.category.length > 0) {
      filtered = filtered.filter(product =>
        filters.category.includes(product.category)
      )
    }

    // Filter by price range (convert product price to INR for comparison)
    filtered = filtered.filter(product =>
      (product.price * INR_CONVERSION_RATE) >= filters.priceRange[0] &&
      (product.price * INR_CONVERSION_RATE) <= filters.priceRange[1]
    )

    setFilteredProducts(filtered)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    let sorted = [...filteredProducts]
    
    switch (value) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price)
        break
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'newest': 
      default:
        sorted = [...filteredProducts] // Keep original order for newest
        break
    }
    
    setFilteredProducts(sorted)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Discover Premium
              <span className="text-gray-600"> Collections</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Curated selection of premium products designed for modern living. 
              Quality, style, and innovation in every piece.
            </p>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <FilterSidebar
                categories={categories}
                onFiltersChange={handleFiltersChange}
                maxPrice={maxPrice}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                All Products ({filteredProducts.length})
              </h2>
              
              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your filters.</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}