import { Flex, Text, HStack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  /** Page title displayed on the left. */
  title: string
  /** Action buttons/controls displayed on the right. */
  actions?: ReactNode
}

/**
 * Consistent page header used across all pages: title on left, actions on right.
 */
export default function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <Flex justify="space-between" align="center" mb={5}>
      <Text fontSize="lg" fontWeight="700" color="white">{title}</Text>
      {actions && <HStack>{actions}</HStack>}
    </Flex>
  )
}
