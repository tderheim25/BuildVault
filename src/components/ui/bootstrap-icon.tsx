import React from 'react'

interface BootstrapIconProps extends React.HTMLAttributes<HTMLElement> {
  name: string
  className?: string
  size?: number | string
}

/**
 * Bootstrap Icon component
 * Usage: <BootstrapIcon name="house" className="text-blue-500" size={24} />
 * 
 * Find icons at: https://icons.getbootstrap.com/
 * Use the icon name without the "bi-" prefix
 */
export function BootstrapIcon({ 
  name, 
  className = '', 
  size = 16,
  ...props 
}: BootstrapIconProps) {
  const sizeClass = typeof size === 'number' 
    ? { width: size, height: size }
    : { width: size, height: size }
  
  return (
    <i 
      className={`bi bi-${name} ${className}`}
      style={{ fontSize: typeof size === 'number' ? `${size}px` : size, ...sizeClass }}
      {...props}
    />
  )
}


