'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

interface Branch {
  id: string
  name: string
  slug: string
}

interface CourseFilterProps {
  selected: string
  onSelect: (slug: string) => void
}

export default function CourseFilter({ selected, onSelect }: CourseFilterProps) {
  const [branches, setBranches] = useState<Branch[]>([])

  useEffect(() => {
    async function fetchBranches() {
      const { data } = await supabase
        .from('branches')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name')

      if (data) {
        setBranches([{ id: 'all', name: 'All', slug: 'all' }, ...data])
      }
    }
    fetchBranches()
  }, [])

  return (
    <div className="flex flex-wrap gap-2">
      {branches.map((branch) => (
        <Button
          key={branch.slug}
          variant={selected === branch.slug ? 'default' : 'outline'}
          size="sm"
          className={cn(
            selected === branch.slug && 'bg-primary text-primary-foreground'
          )}
          onClick={() => onSelect(branch.slug)}
        >
          {branch.name}
        </Button>
      ))}
    </div>
  )
}
