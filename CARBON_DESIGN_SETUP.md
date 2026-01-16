# Carbon Design System Integration Guide

Carbon Design System is now installed! Here's how to use it with your Next.js + Tailwind setup.

## ⚠️ Important Note

Carbon Design System comes with its own comprehensive styling system. Using it alongside Tailwind CSS can cause style conflicts. You have two options:

### Option 1: Use Carbon Components (Full Carbon Styling)
- Full Carbon Design System components
- IBM's enterprise-grade design
- May conflict with Tailwind utilities
- Best for: Enterprise applications needing Carbon's full component library

### Option 2: Use CarbonCN (Tailwind-Compatible)
- Carbon-styled components built with Tailwind
- No style conflicts
- Better integration with your existing Tailwind setup
- Best for: Projects wanting Carbon aesthetics with Tailwind flexibility

## Setup Instructions

### 1. Import Carbon Styles

Add to your `globals.css`:

```css
@import '@carbon/styles/css/styles.css';
```

Or import in your layout/page components:

```tsx
import '@carbon/styles/css/styles.css';
```

### 2. Use Carbon Components

```tsx
import { Button, TextInput, DataTable } from '@carbon/react';

function MyComponent() {
  return (
    <Button kind="primary">Click me</Button>
  );
}
```

### 3. Available Components

Carbon provides many components:
- Buttons, Forms, Data Tables
- Modals, Dropdowns, Tabs
- Navigation, Layout components
- And many more...

Browse all components: https://carbondesignsystem.com/components

## Style Conflicts with Tailwind

Carbon uses its own CSS classes. To avoid conflicts:

1. **Use Carbon components in isolation** - Don't mix Tailwind utilities on Carbon components
2. **Use Tailwind for custom components** - Use Tailwind for your own components
3. **Configure Tailwind prefix** - Add a prefix to Tailwind classes to avoid conflicts

## Alternative: CarbonCN (Recommended for Tailwind Projects)

If you want Carbon aesthetics with Tailwind compatibility, consider CarbonCN:

```bash
npm install @carboncn/core
```

CarbonCN provides Carbon-styled components built with Tailwind CSS, giving you the best of both worlds.

## Example Usage

See `src/components/examples/CarbonExample.tsx` for working examples.


