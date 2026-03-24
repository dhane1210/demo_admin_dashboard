import {
  Box, SimpleGrid, Table, Thead, Tbody, Tr, Th, Td,
  Text, Flex, VStack,
} from '@chakra-ui/react'
import type { Shipment, Alert } from '../../types'
import { fmtDate } from '../../utils/formatters'
import StatusBadge from '../StatusBadge'
import ShipmentMap from '../ShipmentMap'
import DetailField from '../common/DetailField'

interface ShipmentDetailProps {
  shipment: Shipment
  alerts?: Alert[]
}

/**
 * Detail view for a single shipment, displayed inside a modal.
 * Shows shipment fields, containers, a live tracking map, and event timeline.
 */
export default function ShipmentDetail({ shipment: s, alerts = [] }: ShipmentDetailProps) {
  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={6}>
        <DetailField label="Shipment Number" value={s.shipment_number} />
        <DetailField label="Status" value={<StatusBadge status={s.status} />} />
        <DetailField label="Sealine" value={s.sealine_name || s.sealine} />
        <DetailField label="POL" value={s.pol_name} />
        <DetailField label="POD" value={s.pod_name} />
        <DetailField label="Vessel" value={s.vessel_name} />
        <DetailField label="ETD" value={fmtDate(s.etd)} />
        <DetailField label="ETA" value={fmtDate(s.eta)} />
        <DetailField label="Last Event" value={s.last_event} />
        <DetailField label="Shipper" value={s.shipper} />
        <DetailField label="Consignee" value={s.consignee} />
        <DetailField label="Customer" value={s.customer_name} />
      </SimpleGrid>

      {/* Containers */}
      {s.containers && s.containers.length > 0 && (
        <Box mb={6}>
          <Text fontWeight="700" color="white" mb={3}>Containers ({s.containers.length})</Text>
          <Box overflowX="auto" bg="#12141f" borderRadius="10px" border="1px solid" borderColor="surface.border">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr><Th>Number</Th><Th>ISO</Th><Th>Size/Type</Th><Th>Status</Th></Tr>
              </Thead>
              <Tbody>
                {s.containers.map((c) => (
                  <Tr key={c.id}>
                    <Td fontWeight="600" color="white">{c.number}</Td>
                    <Td color="#cbd5e1">{c.iso_code || '—'}</Td>
                    <Td color="#cbd5e1">{c.size_type || '—'}</Td>
                    <Td color="#cbd5e1">{c.status || '—'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* Map View */}
      <Box mb={6}>
        <Text fontWeight="700" color="white" mb={3}>Live Tracking Map</Text>
        <Box borderRadius="12px" overflow="hidden" border="1px solid" borderColor="surface.border">
          <ShipmentMap
            height="300px"
            shipmentsData={s.raw_api_response ? [s.raw_api_response] : []}
            shipments={[s]}
            alerts={alerts}
          />
        </Box>
      </Box>

      {/* Events Timeline */}
      {s.events && s.events.length > 0 && (
        <Box>
          <Text fontWeight="700" color="white" mb={3}>Events ({s.events.length})</Text>
          <VStack align="stretch" spacing={0} pl={4} borderLeft="2px solid" borderColor="surface.border">
            {s.events.slice(0, 20).map((e, i) => (
              <Box key={e.id || i} position="relative" py={2} pl={4}>
                <Box
                  position="absolute" left="-9px" top="14px"
                  w="12px" h="12px" borderRadius="full"
                  bg={e.is_actual ? '#4ade80' : '#6366f1'}
                  border="3px solid #1a1d2e"
                />
                <Flex justify="space-between" align="flex-start">
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color="white">
                      {e.description || e.event_type || 'Event'}
                    </Text>
                    <Text fontSize="xs" color="#64748b">
                      {[e.location_name, e.location_country].filter(Boolean).join(', ')}
                      {e.vessel_name ? ` · ${e.vessel_name}` : ''}
                    </Text>
                  </Box>
                  <Text fontSize="xs" color="#64748b" whiteSpace="nowrap" ml={3}>
                    {fmtDate(e.date)}
                  </Text>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
    </Box>
  )
}
