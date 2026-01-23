/**
 * Example component showing how to use Bootstrap Icons with Tailwind CSS
 * 
 * Bootstrap Icons are already set up via CDN in layout.tsx
 * You can use them in three ways:
 */

import { BootstrapIcon } from '@/components/ui/bootstrap-icon'

export function BootstrapIconsExample() {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-[#1e3a8a]">Bootstrap Icons Examples</h2>
      
      {/* Method 1: Direct class usage (simplest) */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Method 1: Direct Class Usage</h3>
        <div className="flex items-center gap-4">
          <i className="bi bi-building text-[#1e3a8a] text-2xl"></i>
          <i className="bi bi-folder text-blue-500 text-3xl"></i>
          <i className="bi bi-people text-gray-600 text-xl"></i>
          <i className="bi bi-dashboard text-[#1e3a8a] text-2xl"></i>
        </div>
      </div>

      {/* Method 2: Using BootstrapIcon component */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Method 2: BootstrapIcon Component</h3>
        <div className="flex items-center gap-4">
          <BootstrapIcon name="building" className="text-[#1e3a8a]" size={24} />
          <BootstrapIcon name="folder" className="text-blue-500" size={32} />
          <BootstrapIcon name="people" className="text-gray-600" size={20} />
          <BootstrapIcon name="dashboard" className="text-[#1e3a8a]" size={24} />
        </div>
      </div>

      {/* Method 3: With Tailwind utilities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Method 3: With Tailwind Utilities</h3>
        <div className="flex items-center gap-4">
          <i className="bi bi-building text-[#1e3a8a] text-2xl hover:text-[#1e40af] transition-colors cursor-pointer"></i>
          <i className="bi bi-plus-circle-fill text-green-500 text-3xl hover:scale-110 transition-transform cursor-pointer"></i>
          <i className="bi bi-image text-purple-500 text-2xl hover:rotate-12 transition-transform cursor-pointer"></i>
        </div>
      </div>

      {/* Common icons for your app */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Common Icons for BuildVault</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50">
            <i className="bi bi-building text-[#1e3a8a] text-3xl"></i>
            <span className="text-sm text-gray-600">Building</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50">
            <i className="bi bi-folder text-[#1e3a8a] text-3xl"></i>
            <span className="text-sm text-gray-600">Projects</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50">
            <i className="bi bi-people text-[#1e3a8a] text-3xl"></i>
            <span className="text-sm text-gray-600">Users</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50">
            <i className="bi bi-image text-[#1e3a8a] text-3xl"></i>
            <span className="text-sm text-gray-600">Photos</span>
          </div>
        </div>
      </div>
    </div>
  )
}



