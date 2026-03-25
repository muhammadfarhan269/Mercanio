import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Row,
  Column,
  Preview,
} from '@react-email/components'

type OrderItem = {
  productName: string
  variantAttributes: Record<string, string>
  quantity: number
  unitPrice: number
  vendorName: string
}

type OrderConfirmationProps = {
  orderNumber: string
  customerName: string
  items: OrderItem[]
  subtotal: number
  shippingTotal: number
  taxTotal: number
  total: number
  shippingAddress: {
    firstName: string
    lastName: string
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shippingTotal,
  taxTotal,
  total,
  shippingAddress,
}: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Mercanio order {orderNumber} is confirmed</Preview>
      <Body style={{ backgroundColor: '#F5F0EB', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>
          {/* Header */}
          <Section style={{ marginBottom: '32px' }}>
            <Heading
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1A1410',
                margin: '0 0 8px',
                letterSpacing: '-0.4px',
              }}
            >
              Mercanio
            </Heading>
            <Text style={{ color: '#8C7B6E', fontSize: '14px', margin: 0 }}>
              The modern marketplace
            </Text>
          </Section>

          {/* Main card */}
          <Section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E8DDD4',
              padding: '32px',
              marginBottom: '24px',
            }}
          >
            <Heading
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1A1410',
                margin: '0 0 4px',
              }}
            >
              Order confirmed
            </Heading>
            <Text style={{ color: '#8C7B6E', fontSize: '14px', margin: '0 0 24px' }}>
              Hi {customerName}, your order has been received.
            </Text>

            <Text
              style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#8C7B6E',
                margin: '0 0 4px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Order number
            </Text>
            <Text
              style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#C2692A',
                fontFamily: 'monospace',
                margin: '0 0 24px',
              }}
            >
              {orderNumber}
            </Text>

            <Hr style={{ borderColor: '#E8DDD4', margin: '0 0 24px' }} />

            {/* Items */}
            {items.map((item, i) => (
              <Row key={i} style={{ marginBottom: '16px' }}>
                <Column style={{ width: '60%' }}>
                  <Text
                    style={{ fontSize: '14px', fontWeight: '500', color: '#1A1410', margin: '0 0 2px' }}
                  >
                    {item.productName}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#8C7B6E', margin: '0 0 2px' }}>
                    {Object.entries(item.variantAttributes)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </Text>
                  <Text style={{ fontSize: '12px', color: '#8C7B6E', margin: 0 }}>
                    by {item.vendorName} · Qty: {item.quantity}
                  </Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1A1410',
                      fontFamily: 'monospace',
                      margin: 0,
                    }}
                  >
                    {formatPrice(item.unitPrice * item.quantity)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Hr style={{ borderColor: '#E8DDD4', margin: '8px 0 16px' }} />

            {/* Totals */}
            <Row style={{ marginBottom: '8px' }}>
              <Column><Text style={{ fontSize: '13px', color: '#8C7B6E', margin: 0 }}>Subtotal</Text></Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: '13px', color: '#1A1410', fontFamily: 'monospace', margin: 0 }}>
                  {formatPrice(subtotal)}
                </Text>
              </Column>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Column><Text style={{ fontSize: '13px', color: '#8C7B6E', margin: 0 }}>Shipping</Text></Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: '13px', color: shippingTotal === 0 ? '#2B6B4A' : '#1A1410', fontFamily: 'monospace', margin: 0 }}>
                  {shippingTotal === 0 ? 'Free' : formatPrice(shippingTotal)}
                </Text>
              </Column>
            </Row>
            <Row style={{ marginBottom: '16px' }}>
              <Column><Text style={{ fontSize: '13px', color: '#8C7B6E', margin: 0 }}>Tax</Text></Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: '13px', color: '#1A1410', fontFamily: 'monospace', margin: 0 }}>
                  {formatPrice(taxTotal)}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column>
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1A1410', margin: 0 }}>
                  Total
                </Text>
              </Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#1A1410', fontFamily: 'monospace', margin: 0 }}>
                  {formatPrice(total)}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Shipping address */}
          <Section
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E8DDD4',
              padding: '24px 32px',
              marginBottom: '24px',
            }}
          >
            <Text
              style={{
                fontSize: '12px',
                fontWeight: '500',
                color: '#8C7B6E',
                margin: '0 0 8px',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Shipping to
            </Text>
            <Text style={{ fontSize: '14px', color: '#1A1410', margin: '0 0 2px' }}>
              {shippingAddress.firstName} {shippingAddress.lastName}
            </Text>
            <Text style={{ fontSize: '14px', color: '#3D3028', margin: '0 0 2px' }}>
              {shippingAddress.line1}
              {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ''}
            </Text>
            <Text style={{ fontSize: '14px', color: '#3D3028', margin: 0 }}>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
            </Text>
          </Section>

          {/* Footer */}
          <Text style={{ fontSize: '12px', color: '#8C7B6E', textAlign: 'center', margin: 0 }}>
            © {new Date().getFullYear()} Mercanio. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderConfirmationEmail
