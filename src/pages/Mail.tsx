import { useState } from 'react'
import {
  Box, Text, Flex, Button, Input, VStack, HStack,
  FormControl, FormLabel, useToast, Textarea, SimpleGrid
} from '@chakra-ui/react'
import { FiSend, FiSearch, FiAlertCircle, FiCamera } from 'react-icons/fi'
import html2canvas from 'html2canvas'
import { assignmentApi } from '../api/assignments'
import { shipmentApi } from '../api/shipments'
import { alertApi } from '../api/alerts'
import type { Assignment, Shipment, Alert } from '../types'
import StatusBadge from '../components/StatusBadge'
import ShipmentMap from '../components/ShipmentMap'

export default function Mail() {
  const [trackingId, setTrackingId] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [mapScreenshot, setMapScreenshot] = useState<string | null>(null)
  
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const toast = useToast()

  const handleSearch = async () => {
    if (!trackingId.trim()) return
    setLoading(true)
    try {
      // 1. Get assignment by tracking ID
      const assnRes = await assignmentApi.getByTrackingId(trackingId.trim())
      const assn = assnRes.data
      setAssignment(assn)
      
      // 2. Get shipment details
      if (assn.shipment_id) {
        const shipRes = await shipmentApi.getDetail(assn.shipment_id)
        setShipment(shipRes.data)
        
        // 3. Get alerts for this shipment
        const alertRes = await alertApi.getAll({ shipment_id: assn.shipment_id })
        // ensure alerts is an array
        const alertList = (alertRes.data as any)?.data || (Array.isArray(alertRes.data) ? alertRes.data : [])
        setAlerts(alertList.filter((a: Alert) => a.status === 'OPEN'))
        
        // Pre-fill email
        setEmailSubject(`Update on your Shipment: ${assn.tracking_id}`)
        setEmailBody(`Hello ${assn.customer_name},\n\nWe wanted to provide you with an update regarding your shipment. Currently, the status is ${shipRes.data.status}.\n\nAdditional details:\n- Vessel: ${shipRes.data.vessel_name || 'TBA'}\n- Route: ${shipRes.data.pol_name || 'TBA'} to ${shipRes.data.pod_name || 'TBA'}\n\nIf you have any questions, please reply to this email.\n\nThank you,\nEnvio Logistics Team`)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Not found'
      toast({ title: 'Search Failed', description: msg, status: 'error', duration: 4000 })
      setAssignment(null)
      setShipment(null)
      setAlerts([])
      setMapScreenshot(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!assignment || !emailBody.trim() || !emailSubject.trim()) return
    setSending(true)
    try {
      // Backend api /api/v1/communications exists but let's use the assignment send custom email if we had one.
      // Since assignmentApi.sendEmail only sends the default automated template (not custom body), 
      // we'll need to use the communicationApi for custom emails.
      // Assuming a communicationApi exists or using fetch directly since it's simple:
      
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`
      
      const res = await fetch('/api/v1/communications/send', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          template_id: 'custom',
          recipient_email: assignment.customer_email,
          recipient_name: assignment.customer_name,
          subject: emailSubject,
          body: emailBody,
          shipment_id: assignment.shipment_id,
          // Send the map screenshot as a base64 attachment
          attachments: mapScreenshot ? [{ 
            filename: 'shipment_map.png', 
            content: mapScreenshot.split(',')[1],
            encoding: 'base64'
          }] : []
        })
      })
      
      if (!res.ok) throw new Error('Failed to send email')
      
      toast({ title: 'Email Sent!', status: 'success', duration: 3000 })
      setEmailSubject('')
      setEmailBody('')
      setMapScreenshot(null)
    } catch (e: unknown) {
      toast({ title: 'Error', description: 'Failed to send email', status: 'error', duration: 4000 })
    } finally {
      setSending(false)
    }
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={5}>
        <Text fontSize="lg" fontWeight="700" color="white">Automated Mail Manager</Text>
      </Flex>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Left Column - Search & Context */}
        <VStack spacing={6} align="stretch">
          <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" p={6}>
            <Text fontWeight="700" color="white" mb={4}>Lookup Tracking ID</Text>
            <HStack>
              <Input 
                placeholder="TRK-..." 
                value={trackingId} 
                onChange={(e) => setTrackingId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button leftIcon={<FiSearch />} onClick={handleSearch} isLoading={loading}>Search</Button>
            </HStack>
          </Box>

          {shipment && assignment && (
            <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" p={6}>
              <Text fontWeight="700" color="white" mb={4}>Customer & Shipment Context</Text>
              
              <SimpleGrid columns={2} spacing={4} mb={6}>
                <Box>
                  <Text fontSize="xs" color="#64748b" textTransform="uppercase">Customer</Text>
                  <Text color="white" fontWeight="600">{assignment.customer_name}</Text>
                  <Text color="#cbd5e1" fontSize="sm">{assignment.customer_email}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="#64748b" textTransform="uppercase">Status</Text>
                  <Box mt={1}><StatusBadge status={shipment.status} /></Box>
                </Box>
                <Box>
                  <Text fontSize="xs" color="#64748b" textTransform="uppercase">Shipment No.</Text>
                  <Text color="white" fontWeight="600">{shipment.shipment_number || 'N/A'}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="#64748b" textTransform="uppercase">Vessel / Route</Text>
                  <Text color="white">{shipment.vessel_name || 'N/A'}</Text>
                  <Text color="#cbd5e1" fontSize="sm">{shipment.pol_name} → {shipment.pod_name}</Text>
                </Box>
              </SimpleGrid>

              {alerts.length > 0 && (
                <Box bg="rgba(239, 68, 68, 0.1)" border="1px solid rgba(239, 68, 68, 0.2)" borderRadius="8px" p={4}>
                  <Flex align="center" mb={2}>
                    <FiAlertCircle color="#ef4444" />
                    <Text color="#ef4444" fontWeight="600" ml={2}>Active Alerts Impacting Customer</Text>
                  </Flex>
                  <VStack align="stretch" spacing={2}>
                    {alerts.map(a => (
                      <Text key={a.id} color="#fca5a5" fontSize="sm">• {a.alert_info || a.alert_type}</Text>
                    ))}
                  </VStack>
                </Box>
              )}
            </Box>
          )}

          {/* Map View */}
          {shipment && (
            <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" p={6}>
              <Flex justify="space-between" align="center" mb={4}>
                 <Text fontWeight="700" color="white">Live Tracking Map</Text>
                 <Button 
                   size="xs" leftIcon={<FiCamera />} variant="outline" 
                   onClick={async () => {
                     const el = document.getElementById('map-container')
                     if (el) {
                       const canvas = await html2canvas(el)
                       setMapScreenshot(canvas.toDataURL('image/png'))
                       toast({ title: 'Screenshot attached to email!', status: 'info', duration: 2000 })
                     }
                   }}
                 >
                   Capture for Email
                 </Button>
              </Flex>
              <Box id="map-container" borderRadius="12px" overflow="hidden">
                 <ShipmentMap 
                   height="300px"
                   shipmentsData={shipment.raw_api_response ? [shipment.raw_api_response] : []}
                   shipments={[shipment]}
                   alerts={alerts}
                 />
              </Box>
            </Box>
          )}

        </VStack>

        {/* Right Column - Email Composer */}
        {shipment && assignment && (
          <Box bg="surface.card" border="1px solid" borderColor="surface.border" borderRadius="14px" p={6}>
            <Text fontWeight="700" color="white" mb={4}>Compose Email</Text>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" color="#94a3b8">To:</FormLabel>
                <Input value={`${assignment.customer_name} <${assignment.customer_email}>`} isReadOnly bg="#12141f" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="#94a3b8">Subject:</FormLabel>
                <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
              </FormControl>
              {mapScreenshot && (
                <Box w="full" bg="#12141f" p={2} borderRadius="8px" border="1px solid #2d3148">
                  <Text fontSize="xs" color="#4ade80" mb={2}>✓ Map screenshot attached</Text>
                  <Box w="full" h="100px" backgroundImage={`url(${mapScreenshot})`} backgroundSize="cover" backgroundPosition="center" borderRadius="6px" />
                  <Button size="xs" variant="ghost" color="#ef4444" mt={1} onClick={() => setMapScreenshot(null)}>Remove Attachment</Button>
                </Box>
              )}
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="#94a3b8">Message Body:</FormLabel>
                <Textarea 
                  value={emailBody} 
                  onChange={(e) => setEmailBody(e.target.value)} 
                  rows={10} 
                  fontFamily="mono" 
                  fontSize="sm"
                />
              </FormControl>
              <Button 
                w="full" 
                leftIcon={<FiSend />} 
                onClick={handleSendEmail} 
                isLoading={sending}
              >
                Send Email Update
              </Button>
            </VStack>
          </Box>
        )}
      </SimpleGrid>
    </Box>
  )
}
