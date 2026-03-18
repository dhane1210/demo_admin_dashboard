import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  Text, VStack, Box, Heading, Flex, Badge, Divider
} from '@chakra-ui/react'
import StatusBadge from './StatusBadge'

interface InstructionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InstructionsModal({ isOpen, onClose }: InstructionsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
      <ModalContent bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="20px">
        <ModalHeader borderBottom="1px solid" borderColor="surface.border" color="white" py={5}>
          <Heading size="md">Dashboard User Guide</Heading>
        </ModalHeader>
        <ModalCloseButton color="#94a3b8" top={4} />
        
        <ModalBody py={6}>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading size="xs" color="brand.400" textTransform="uppercase" mb={3} letterSpacing="0.05em">
                1. Shipment Status Tracking
              </Heading>
              <Text fontSize="sm" color="#cbd5e1" mb={3}>
                Our system uses dynamic status tracking mapped from DCSA standard events. 
              </Text>
              <VStack align="stretch" spacing={2}>
                <Flex align="center" gap={3}>
                  <StatusBadge status="IN_TRANSIT" />
                  <Text fontSize="xs" color="#94a3b8">Shipment is currently moving between ports.</Text>
                </Flex>
                <Flex align="center" gap={3}>
                  <StatusBadge status="ARRIVED" />
                  <Text fontSize="xs" color="#94a3b8">Vessel has reached the Destination Port (POD).</Text>
                </Flex>
                <Flex align="center" gap={3}>
                  <StatusBadge status="DELAYED" />
                  <Text fontSize="xs" color="#94a3b8">Potential delay detected based on latest ETA updates.</Text>
                </Flex>
              </VStack>
            </Box>

            <Divider borderColor="surface.border" />

            <Box>
              <Heading size="xs" color="brand.400" textTransform="uppercase" mb={3} letterSpacing="0.05em">
                2. Webhook Alerts Explained
              </Heading>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Badge colorScheme="red" variant="subtle" mb={1}>ETA_CHANGED</Badge>
                  <Text fontSize="xs" color="#cbd5e1">Fired when the carrier updates the Estimated Time of Arrival. Critical for logistics planning.</Text>
                </Box>
                <Box>
                  <Badge colorScheme="blue" variant="subtle" mb={1}>ARRIVAL</Badge>
                  <Text fontSize="xs" color="#cbd5e1">Fired immediately upon vessel berthing or container discharge at the destination port.</Text>
                </Box>
                <Box>
                  <Badge colorScheme="orange" variant="subtle" mb={1}>EQUIPMENT</Badge>
                  <Text fontSize="xs" color="#cbd5e1">Relates to physical container moves (Gate In, Gate Out, Loaded).</Text>
                </Box>
              </VStack>
            </Box>

            <Divider borderColor="surface.border" />

            <Box>
              <Heading size="xs" color="brand.400" textTransform="uppercase" mb={3} letterSpacing="0.05em">
                3. Severity & Status
              </Heading>
              <Flex gap={4}>
                <VStack align="stretch" flex={1}>
                  <Text fontSize="xs" fontWeight="700" color="#64748b">AUTO-SEVERITY</Text>
                  <StatusBadge status="HIGH" />
                  <Text fontSize="10px" color="#94a3b8">Delayed &gt; 48h</Text>
                  <StatusBadge status="MEDIUM" />
                  <Text fontSize="10px" color="#94a3b8">Minor schedule shift</Text>
                </VStack>
                <VStack align="stretch" flex={1}>
                  <Text fontSize="xs" fontWeight="700" color="#64748b">ALERT LIFE CYCLE</Text>
                  <StatusBadge status="OPEN" />
                  <Text fontSize="10px" color="#94a3b8">New / Unread</Text>
                  <StatusBadge status="RESOLVED" />
                  <Text fontSize="10px" color="#94a3b8">Issue handled</Text>
                </VStack>
              </Flex>
            </Box>

            <Divider borderColor="surface.border" />

            <Box>
              <Heading size="xs" color="brand.400" textTransform="uppercase" mb={3} letterSpacing="0.05em">
                4. Dynamic ETA Progress
              </Heading>
              <Text fontSize="sm" color="#cbd5e1">
                The **ETA Progress Bar** is fully dynamic. It calculates the percentage by comparing the current time against the **ETD** (Departure) and **ETA** (Arrival) dates.
              </Text>
              <Box mt={2} bg="rgba(0,0,0,0.3)" p={3} borderRadius="10px" border="1px dashed" borderColor="brand.500">
                <Text fontSize="10px" color="brand.400" fontFamily="mono">
                  Progress % = (CurrentTime - ETD) / (ETA - ETD) * 100
                </Text>
              </Box>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
