/**
 * Example component showing Carbon Design System usage
 * 
 * Note: Carbon components have their own styling system.
 * Mix carefully with Tailwind to avoid conflicts.
 */

'use client'

import { Button, TextInput, DataTable, TableContainer, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react'

export function CarbonExample() {
  const headers = ['Name', 'Status', 'Role']
  const rows = [
    { id: '1', name: 'John Doe', status: 'Active', role: 'Admin' },
    { id: '2', name: 'Jane Smith', status: 'Active', role: 'Manager' },
    { id: '3', name: 'Bob Johnson', status: 'Pending', role: 'Staff' },
  ]

  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-[#1e3a8a]">Carbon Design System Examples</h2>
      
      {/* Buttons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Buttons</h3>
        <div className="flex gap-4">
          <Button kind="primary">Primary Button</Button>
          <Button kind="secondary">Secondary Button</Button>
          <Button kind="tertiary">Tertiary Button</Button>
          <Button kind="danger">Danger Button</Button>
        </div>
      </div>

      {/* Form Inputs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Form Inputs</h3>
        <div className="max-w-md space-y-4">
          <TextInput
            id="email"
            labelText="Email"
            placeholder="Enter your email"
            helperText="We'll never share your email"
          />
          <TextInput
            id="password"
            type="password"
            labelText="Password"
            placeholder="Enter your password"
            invalid={false}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Table</h3>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((header) => (
                  <TableHeader key={header}>{header}</TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.role}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Note about Tailwind */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Carbon components have their own styling. 
          Use Tailwind utilities carefully to avoid conflicts. Consider using CarbonCN 
          if you want Carbon aesthetics with full Tailwind compatibility.
        </p>
      </div>
    </div>
  )
}



