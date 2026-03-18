import { Box, Flex, Text, Tooltip } from '@chakra-ui/react'
import { motion } from 'framer-motion'

interface EtaProgressBarProps {
  etd: string | null | undefined
  eta: string | null | undefined
  ata?: string | null | undefined
  status?: string | null
}

export default function EtaProgressBar({ etd, eta, ata, status }: EtaProgressBarProps) {
  // If we don't have departure dates or arrival dates, we can't show a bar properly
  if (!etd || !eta) {
    return (
      <Flex direction="column" gap={1} opacity={0.5}>
        <Box w="full" bg="surface.border" h="4px" borderRadius="full" />
        <Text fontSize="10px" color="#94a3b8">Pending Route Data</Text>
      </Flex>
    )
  }

  // Calculate timelines
  const sDate = new Date(etd).getTime()
  const eDate = new Date(eta).getTime()
  const cDate = Date.now()
  const aDate = ata ? new Date(ata).getTime() : null

  // Total duration in ms
  const total = eDate - sDate

  // Ensure calculations are valid strings
  if (isNaN(sDate) || isNaN(eDate) || total <= 0) {
    return (
      <Flex direction="column" gap={1} opacity={0.5}>
        <Box w="full" bg="surface.border" h="4px" borderRadius="full" />
        <Text fontSize="10px" color="#94a3b8">Dates Unavailable</Text>
      </Flex>
    )
  }

  let progress = 0
  let isArrived = false
  let label = ''

  if (status === 'COMPLETED' || status === 'ARRIVED' || status === 'DELIVERED' || status === 'DISCHARGED') {
    progress = 100
    isArrived = true
    label = `Arrived on ${new Date(aDate || eDate).toLocaleDateString()}`
  } else if (cDate > eDate) {
    // We are past the ETA but status is not COMPLETED/ARRIVED. It might be delayed.
    progress = 98 // visual cue that it is approaching, maybe hanging at end
    const daysOverdue = Math.ceil((cDate - eDate) / (1000 * 60 * 60 * 24))
    label = `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`
  } else if (cDate < sDate) {
    // Has not departed yet
    progress = 0
    const daysToDeparture = Math.ceil((sDate - cDate) / (1000 * 60 * 60 * 24))
    label = `Departs in ${daysToDeparture} day${daysToDeparture > 1 ? 's' : ''}`
  } else {
    // In transit
    progress = ((cDate - sDate) / total) * 100
    // safety caps
    progress = Math.max(2, Math.min(progress, 99))
    const daysToGo = Math.ceil((eDate - cDate) / (1000 * 60 * 60 * 24))
    label = `${daysToGo} day${daysToGo > 1 ? 's' : ''} to ETA`
  }

  // Color logic
  let barColor = '#6366f1' // indigo for in transit
  if (isArrived) barColor = '#4ade80' // green for arrived
  if (status === 'DELAYED' || (cDate > eDate && !isArrived)) barColor = '#f87171' // red

  return (
    <Tooltip label={label} placement="top" bg="surface.base" color="white" hasArrow>
      <Flex direction="column" gap="6px" w="full" maxW="150px" title={label}>
        <Flex justify="space-between" w="full">
          <Text fontSize="10px" fontWeight="600" color="#94a3b8">ETD</Text>
          <Text fontSize="10px" fontWeight="700" color={barColor}>{Math.floor(progress)}%</Text>
          <Text fontSize="10px" fontWeight="600" color="#94a3b8">ETA</Text>
        </Flex>
        <Box w="full" bg="#1e2133" h="6px" borderRadius="full" overflow="hidden" position="relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              height: '100%',
              backgroundColor: barColor,
              borderRadius: '99px',
              position: 'relative',
              boxShadow: `0 0 10px ${barColor}80`
            }}
          >
            {/* Shimmer effect for in-transit items */}
            {progress > 0 && progress < 100 && (
              <Box
                position="absolute"
                top="0"
                right="0"
                bottom="0"
                left="0"
                backgroundImage="linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)"
                style={{ animation: 'shimmer 2s infinite' }}
              />
            )}
          </motion.div>
        </Box>
        <Text fontSize="9px" color="#64748b" textAlign="center" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
          {label}
        </Text>
        <style>{`
          @keyframes shimmer {
            100% { transform: translateX(100%); }
            0% { transform: translateX(-100%); }
          }
        `}</style>
      </Flex>
    </Tooltip>
  )
}
