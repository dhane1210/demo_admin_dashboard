import { Flex, Spinner } from '@chakra-ui/react'

interface LoadingSpinnerProps {
  /** Minimum height for the spinner container. Defaults to '400px'. */
  minH?: string
  /** Spinner size. Defaults to 'xl'. */
  size?: string
}

/**
 * Full-area centered loading spinner used across all pages.
 */
export default function LoadingSpinner({ minH = '400px', size = 'xl' }: LoadingSpinnerProps) {
  return (
    <Flex justify="center" align="center" minH={minH}>
      <Spinner size={size} color="brand.400" thickness="3px" />
    </Flex>
  )
}
