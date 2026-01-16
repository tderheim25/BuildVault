import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ProjectCardProps {
  id: string
  name: string
  description?: string | null
  createdAt: string
}

export function ProjectCard({ id, name, description, createdAt }: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <Card className="dashboard-card hover:shadow-md transition-all duration-200 cursor-pointer h-full group border-gray-200">
        <CardHeader>
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center group-hover:from-indigo-200 group-hover:to-blue-200 transition-all duration-200">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-xl text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
            {name}
          </CardTitle>
          {description && (
            <CardDescription className="text-gray-600 line-clamp-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Created {new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


