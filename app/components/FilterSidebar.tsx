'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FilterSidebarProps {
  categories: string[]
  onFiltersChange: (filters: {
    category: string[]
    priceRange: [number, number]
  }) => void
  maxPrice: number
}

export default function FilterSidebar({
  categories,
  onFiltersChange,
  maxPrice,
}: FilterSidebarProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice])

  // Add this useEffect hook
  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...selectedCategories, category]
      : selectedCategories.filter(c => c !== category)
    
    setSelectedCategories(newCategories)
    onFiltersChange({
      category: newCategories,
      priceRange,
    })
  }

  const handlePriceChange = (newRange: number[]) => {
    const range: [number, number] = [newRange[0], newRange[1]]
    setPriceRange(range)
    onFiltersChange({
      category: selectedCategories,
      priceRange: range,
    })
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, maxPrice])
    onFiltersChange({
      category: [],
      priceRange: [0, maxPrice],
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-base font-medium">Price Range</Label>
          <div className="mt-3 space-y-3">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={maxPrice}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
              <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-base font-medium">Categories</Label>
          <div className="mt-3 space-y-3">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category, checked as boolean)
                  }
                />
                <Label
                  htmlFor={category}
                  className="text-sm font-normal cursor-pointer capitalize"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}