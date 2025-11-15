interface AssignmentBadgeProps {
  interviewer: { name: string } | null
  variant?: 'default' | 'compact'
}

export default function AssignmentBadge({ interviewer, variant = 'default' }: AssignmentBadgeProps) {
  if (!interviewer) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Unassigned
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        {interviewer.name}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Assigned to {interviewer.name}
    </span>
  )
}
