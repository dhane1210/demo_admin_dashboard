import { useState } from 'react'
import {
  Box, Button, Flex, FormControl, FormLabel, Input,
  Text, VStack, useToast, InputGroup, InputRightElement,
  IconButton
} from '@chakra-ui/react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/auth'
import { AUTH_TOKEN_KEY } from '../constants'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login({ username, password })
      if (res.success && res.data?.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, res.data.token)
        toast({ title: 'Welcome Back!', status: 'success', duration: 3000 })
        navigate('/')
      } else {
        throw new Error(res.error || 'Invalid credentials')
      }
    } catch (e: any) {
      toast({
        title: 'Authentication Failed',
        description: e.message || 'Please check your credentials',
        status: 'error',
        duration: 4000
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg="surface.bg" p={4}>
      <Box
        w="full" maxW="400px" p={8}
        bg="surface.card" border="1px solid" borderColor="surface.border"
        borderRadius="20px" boxShadow="xl"
      >
        <VStack spacing={6}>
          <Box textAlign="center" mb={2}>
            <Text fontSize="2xl" fontWeight="800" color="white" letterSpacing="-0.02em">
              Envio <Text as="span" color="brand.400">Logistics</Text>
            </Text>
            <Text fontSize="sm" color="#64748b" mt={1}>Admin Portal Access</Text>
          </Box>

          <form style={{ width: '100%' }} onSubmit={handleLogin}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="xs" color="#94a3b8" fontWeight="600" textTransform="uppercase">Username</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    bg="rgba(15,17,23,0.4)"
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="xs" color="#94a3b8" fontWeight="600" textTransform="uppercase">Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="rgba(15,17,23,0.4)"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label="Toggle password"
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <Button
                type="submit"
                w="full"
                h="48px"
                bg="brand.500"
                _hover={{ bg: 'brand.600' }}
                color="white"
                borderRadius="12px"
                isLoading={loading}
                mt={4}
              >
                Sign In
              </Button>
            </VStack>
          </form>

          <Text fontSize="xs" color="#475569" textAlign="center">
            &copy; {new Date().getFullYear()} Envio Project. All rights reserved.
          </Text>
        </VStack>
      </Box>
    </Flex>
  )
}
