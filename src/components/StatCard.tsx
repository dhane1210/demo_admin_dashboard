import { Box, Flex, Icon, Text } from '@chakra-ui/react'
import type { IconType } from 'react-icons'

interface StatCardProps {
  label: string
  value: number | string
  icon: IconType
  accentColor: string
  subtitle?: string
}

export default function StatCard({ label, value, icon, accentColor, subtitle }: StatCardProps) {
  return (
    <Box
      bg="surface.card"
      border="1px solid"
      borderColor="surface.border"
      borderRadius="14px"
      p={5}
      position="relative"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{
        borderColor: 'surface.borderHover',
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px -5px ${accentColor}20`,
      }}
    >
      {/* Accent gradient glow */}
      <Box
        position="absolute"
        top="-30px"
        right="-30px"
        w="100px"
        h="100px"
        borderRadius="full"
        bg={accentColor}
        opacity={0.06}
        filter="blur(25px)"
      />

      <Flex justify="space-between" align="flex-start" mb={3}>
        <Text fontSize="0.78rem" fontWeight="600" color="#64748b" textTransform="uppercase" letterSpacing="0.05em">
          {label}
        </Text>
        <Flex
          w="38px" h="38px" borderRadius="10px"
          bg={`${accentColor}18`}
          align="center" justify="center"
        >
          <Icon as={icon} boxSize={5} color={accentColor} />
        </Flex>
      </Flex>

      <Text fontSize="2rem" fontWeight="800" color={accentColor} lineHeight="1">
        {value}
      </Text>

      {subtitle && (
        <Text fontSize="xs" color="#64748b" mt={1}>{subtitle}</Text>
      )}
    </Box>
  )
}
