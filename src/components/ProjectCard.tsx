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
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="text-lg">{name}</CardTitle>
          {description && (
            <CardDescription className="line-clamp-2">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">
            Created: {new Date(createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}


