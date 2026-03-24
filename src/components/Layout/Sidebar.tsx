import { Box, Flex, Icon, Text, VStack, Image } from '@chakra-ui/react'
import { NavLink, useLocation } from 'react-router-dom'
import { NAV_ITEMS } from '../../constants'

export default function Sidebar() {
  const location = useLocation()

  return (
    <Box
      as="nav"
      w="240px"
      minH="100vh"
      bg="linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)"
      borderRight="1px solid"
      borderColor="surface.border"
      position="fixed"
      left={0}
      top={0}
      zIndex={20}
      overflowY="auto"
    >
      {/* Logo */}
      <Flex align="center" gap={3} px={5} py={5} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Flex
          w="36px" h="36px" borderRadius="10px"
          bg="brand.500" align="center" justify="center"
        >
          <Image src="" fallback={<Text fontSize="lg" fontWeight="800" color="white">E</Text>} />
        </Flex>
        <Box>
          <Text fontSize="md" fontWeight="700" color="white" lineHeight="1.2">Envio</Text>
          <Text fontSize="xs" color="whiteAlpha.600" fontWeight="500">Logistics Admin</Text>
        </Box>
      </Flex>

      {/* Nav Items */}
      <VStack spacing={1} align="stretch" px={3} py={4}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)

          return (
            <Box
              key={item.path}
              as={NavLink}
              to={item.path}
              display="flex"
              alignItems="center"
              gap={3}
              px={3}
              py="10px"
              borderRadius="10px"
              fontSize="0.9rem"
              fontWeight={isActive ? 600 : 500}
              color={isActive ? 'white' : '#94a3b8'}
              bg={isActive ? 'rgba(99,102,241,0.2)' : 'transparent'}
              _hover={{
                bg: isActive ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.08)',
                color: 'white',
              }}
              transition="all 0.15s ease"
              textDecoration="none"
            >
              <Icon
                as={item.icon}
                boxSize={5}
                color={isActive ? 'brand.400' : '#64748b'}
              />
              <Text>{item.label}</Text>
              {isActive && (
                <Box
                  ml="auto"
                  w="3px"
                  h="20px"
                  borderRadius="2px"
                  bg="brand.400"
                />
              )}
            </Box>
          )
        })}
      </VStack>
    </Box>
  )
}
