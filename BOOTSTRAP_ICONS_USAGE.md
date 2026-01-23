# Using Bootstrap Icons with Tailwind CSS

Bootstrap Icons work perfectly with Tailwind CSS! Here are the ways to use them:

## Method 1: Icon Font (Easiest - Already Set Up)

The Bootstrap Icons CSS is already added to your layout. You can use icons directly:

```tsx
// Simple usage
<i className="bi bi-house text-[#1e3a8a] text-xl"></i>

// With Tailwind classes
<i className="bi bi-building text-[#1e3a8a] text-2xl"></i>
```

## Method 2: Using the BootstrapIcon Component

I've created a helper component for easier usage:

```tsx
import { BootstrapIcon } from '@/components/ui/bootstrap-icon'

// In your component
<BootstrapIcon name="house" className="text-[#1e3a8a]" size={24} />
<BootstrapIcon name="building" className="text-blue-500" size="1.5rem" />
```

## Method 3: Direct SVG Import (For Tree Shaking)

For better performance, you can import individual SVG files:

```tsx
import buildingIcon from 'bootstrap-icons/icons/building.svg'
import Image from 'next/image'

<Image src={buildingIcon} alt="Building" width={24} height={24} />
```

## Example: Replacing Lucide Icons

You can replace Lucide icons with Bootstrap Icons:

**Before (Lucide):**
```tsx
import { Building2 } from 'lucide-react'
<Building2 className="h-6 w-6" />
```

**After (Bootstrap Icons):**
```tsx
<i className="bi bi-building text-[#1e3a8a] text-2xl"></i>
// or
<BootstrapIcon name="building" className="text-[#1e3a8a]" size={24} />
```

## Common Bootstrap Icons for Your App

- `bi-building` - Building/construction
- `bi-folder` - Projects/folders
- `bi-people` - Users
- `bi-dashboard` - Dashboard
- `bi-plus-circle` - Add/New
- `bi-image` - Photos
- `bi-gear` - Settings
- `bi-box-arrow-right` - Logout

## Find More Icons

Browse all available icons at: https://icons.getbootstrap.com/

Just use the icon name without the "bi-" prefix when using the component, or include "bi-" when using the class directly.



