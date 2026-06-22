import { NextResponse } from 'next/server'
// @ts-ignore
import midtransClient from 'midtrans-client'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { price, pricing_id, username, email } = body

    // Create Snap API instance
    const isProduction = process.env.NODE_ENV === 'production'
    const snap = new midtransClient.Snap({
      isProduction,
      serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    })

    const parameter = {
      transaction_details: {
        order_id: `ORDER-${pricing_id}-${Date.now()}`,
        gross_amount: price,
      },
      customer_details: {
        first_name: username || 'Customer',
        email: email || 'customer@example.com',
      },
      credit_card: {
        secure: true,
      },
    }

    const transaction = await snap.createTransaction(parameter)
    
    return NextResponse.json({ 
      token: transaction.token, 
      redirect_url: transaction.redirect_url,
      order_id: parameter.transaction_details.order_id 
    })
  } catch (error: any) {
    console.error('Midtrans Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create transaction' }, { status: 500 })
  }
}
