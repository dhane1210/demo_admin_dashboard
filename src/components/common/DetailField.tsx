import { Box, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface DetailFieldProps {
  label: string
  value: ReactNode
}

/**
 * Reusable label/value display for detail modals and info panels.
 */
export default function DetailField({ label, value }: DetailFieldProps) {
  return (
    <Box>
      <Text fontSize="0.7rem" color="#64748b" textTransform="uppercase" letterSpacing="0.05em" mb={1}>
        {label}
      </Text>
      <Text fontSize="sm" color="white">{value || '—'}</Text>
    </Box>
  )
}
