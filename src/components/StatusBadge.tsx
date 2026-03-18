import { Badge } from '@chakra-ui/react'

const statusColors: Record<string, { bg: string; color: string }> = {
  // Main Statuses
  ON_SCHEDULE: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  IN_TRANSIT: { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' },
  DELAYED: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  ARRIVED: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  COMPLETED: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  PLANNED: { bg: 'rgba(163,163,163,0.15)', color: '#a3a3a3' },
  
  // Granular Event Statuses
  GATE_IN: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' }, // purple
  GATE_OUT: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  LOADED: { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' }, // orange
  DISCHARGED: { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
  SAILED: { bg: 'rgba(56,189,248,0.15)', color: '#38bdf8' }, // sky blue
  AT_PORT: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' }, // blue
  PICKED_UP: { bg: 'rgba(129,140,248,0.15)', color: '#818cf8' }, // indigo
  DROPPED_OFF: { bg: 'rgba(129,140,248,0.15)', color: '#818cf8' },
  CANCELLED: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  ON_HOLD: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' }, // yellow

  // Alerts & UI States
  OPEN: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  ACKNOWLEDGED: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  RESOLVED: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  HIGH: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  MEDIUM: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  LOW: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  DRAFT: { bg: 'rgba(163,163,163,0.15)', color: '#a3a3a3' },
  QUOTED: { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  ACCEPTED: { bg: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  REJECTED: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },

  // Webhook Alert Types
  ARRIVAL: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  DEPARTURE: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa' },
  EQUIPMENT: { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
  ETA_CHANGED: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  STATUS_CHANGED: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
}

interface StatusBadgeProps {
  status: string | null | undefined
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const s = status || 'N/A'
  const style = statusColors[s] || { bg: 'rgba(163,163,163,0.15)', color: '#a3a3a3' }

  return (
    <Badge
      bg={style.bg}
      color={style.color}
      px={3}
      py={1}
      borderRadius="6px"
      fontSize="0.72rem"
      fontWeight="700"
      letterSpacing="0.03em"
      textTransform="uppercase"
    >
      {s.replace(/_/g, ' ')}
    </Badge>
  )
}
