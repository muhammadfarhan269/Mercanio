import { Resend } from 'resend'
import { OrderConfirmationEmail } from '@/emails/order-confirmation'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

const resend = new Resend(process.env.RESEND_API_KEY)

type OrderEmailData = {
  to: string
  orderNumber: string
  customerName: string
  items: {
    productName: string
    variantAttributes: Record<string, string>
    quantity: number
    unitPrice: number
    vendorName: string
  }[]
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

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    await resend.emails.send({
      from: 'Mercanio <onboarding@resend.dev>',
      to: data.to,
      subject: `Order confirmed — ${data.orderNumber}`,
      react: OrderConfirmationEmail({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        items: data.items,
        subtotal: data.subtotal,
        shippingTotal: data.shippingTotal,
        taxTotal: data.taxTotal,
        total: data.total,
        shippingAddress: data.shippingAddress,
      }),
    })
  } catch (error) {
    // Email failure should not break order creation
    console.error('[EMAIL_ORDER_CONFIRMATION]', error)
  }
}
