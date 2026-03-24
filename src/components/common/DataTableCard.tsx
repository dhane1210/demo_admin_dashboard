import { Box, Flex, Spinner } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface DataTableCardProps {
  /** Whether data is currently loading. */
  loading?: boolean
  /** Table content (Table component with Thead/Tbody). */
  children: ReactNode
  /** Footer content (e.g. pagination). */
  footer?: ReactNode
}

/**
 * Reusable card wrapper for data tables with consistent styling, loading state,
 * and optional footer (pagination).
 */
export default function DataTableCard({ loading, children, footer }: DataTableCardProps) {
  return (
    <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" overflow="hidden">
      {loading ? (
        <Flex justify="center" py={16}>
          <Spinner size="lg" color="brand.400" />
        </Flex>
      ) : (
        <>
          <Box overflowX="auto">{children}</Box>
          {footer}
        </>
      )}
    </Box>
  )
}
