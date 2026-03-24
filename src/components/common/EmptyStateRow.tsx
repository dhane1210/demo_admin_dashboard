import { Tr, Td, Text } from '@chakra-ui/react'

interface EmptyStateRowProps {
  /** Number of columns to span. */
  colSpan: number
  /** Message to display. */
  message?: string
}

/**
 * Empty state table row shown when no data is available.
 */
export default function EmptyStateRow({ colSpan, message = 'No items found.' }: EmptyStateRowProps) {
  return (
    <Tr>
      <Td colSpan={colSpan} textAlign="center" color="#64748b" py={8}>
        <Text>{message}</Text>
      </Td>
    </Tr>
  )
}
