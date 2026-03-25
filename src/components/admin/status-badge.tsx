// Shared status badge for admin tables — inline styles to guarantee rendering
const STYLES: Record<string, { backgroundColor: string; color: string }> = {
  // Green
  ACTIVE:    { backgroundColor: '#E6F0EB', color: '#1E5C38' },
  CONFIRMED: { backgroundColor: '#E6F0EB', color: '#1E5C38' },
  DELIVERED: { backgroundColor: '#E6F0EB', color: '#1E5C38' },
  PAID:      { backgroundColor: '#E6F0EB', color: '#1E5C38' },
  // Amber
  PENDING:            { backgroundColor: '#FBF0E0', color: '#7A5218' },
  PROCESSING:         { backgroundColor: '#FBF0E0', color: '#7A5218' },
  PARTIALLY_SHIPPED:  { backgroundColor: '#FBF0E0', color: '#7A5218' },
  SHIPPED:            { backgroundColor: '#FBF0E0', color: '#7A5218' },
  UNFULFILLED:        { backgroundColor: '#FBF0E0', color: '#7A5218' },
  ON_HOLD:            { backgroundColor: '#FBF0E0', color: '#7A5218' },
  PENDING_REVIEW:     { backgroundColor: '#FBF0E0', color: '#7A5218' },
  // Red
  SUSPENDED:          { backgroundColor: '#F5EBEB', color: '#8C3A2A' },
  CANCELLED:          { backgroundColor: '#F5EBEB', color: '#8C3A2A' },
  REFUNDED:           { backgroundColor: '#F5EBEB', color: '#8C3A2A' },
  PARTIALLY_REFUNDED: { backgroundColor: '#F5EBEB', color: '#8C3A2A' },
  PAYMENT_FAILED:     { backgroundColor: '#F5EBEB', color: '#8C3A2A' },
  BANNED:             { backgroundColor: '#F5EBEB', color: '#8C3A2A' },
  REJECTED:           { backgroundColor: '#F5EBEB', color: '#8C3A2A' },
  ARCHIVED:           { backgroundColor: '#F5EBEB', color: '#8C3A2A' },
  FAILED:             { backgroundColor: '#F5EBEB', color: '#8C3A2A' },
  RETURNED:           { backgroundColor: '#F5EBEB', color: '#8C3A2A' },
}

const DEFAULT_STYLE = { backgroundColor: '#F5F0EB', color: '#8C7B6E' }

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? DEFAULT_STYLE
  const label = status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ')
  return (
    <span
      style={{ ...style, padding: '2px 10px', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap' }}
    >
      {label}
    </span>
  )
}
