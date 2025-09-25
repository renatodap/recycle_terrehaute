# Stripe Payment Integration Guide

## 1. Stripe Account Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard:
   - Publishable key (starts with `pk_`)
   - Secret key (starts with `sk_`)

## 2. Install Required Packages

```bash
cd recycle-th-native
npm install @stripe/stripe-react-native
npx expo install expo-build-properties
```

## 3. Configure Stripe in Your App

### Add to app.json:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": "21"
          },
          "ios": {
            "deploymentTarget": "13.0"
          }
        }
      ],
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.recycleth.app",
          "enableGooglePay": true,
          "enableApplePay": true
        }
      ]
    ]
  }
}
```

## 4. Supabase Edge Functions for Stripe

Create these edge functions in your Supabase project:

### create-checkout-session.ts
```typescript
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.4.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { priceId, userId, email } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: 'recycleth://subscription-success',
      cancel_url: 'recycleth://subscription-cancel',
      customer_email: email,
      metadata: {
        userId,
      },
    })

    return new Response(JSON.stringify({ sessionId: session.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### stripe-webhook.ts
```typescript
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.4.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL'),
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    )

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        await updateUserSubscription(session.metadata.userId, 'premium')
        break

      case 'customer.subscription.deleted':
        const subscription = event.data.object
        await updateUserSubscription(subscription.metadata.userId, 'free')
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

async function updateUserSubscription(userId: string, tier: string) {
  await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_start_date: tier === 'premium' ? new Date().toISOString() : null
    })
    .eq('id', userId)
}
```

## 5. Create Stripe Products

In your Stripe Dashboard:

1. Go to Products
2. Create products:
   - **Premium Plan**: $2.99/month
     - Price ID: `price_premium_monthly`
   - **Business Plan**: $9.99/month
     - Price ID: `price_business_monthly`

## 6. Environment Variables

Add to your `.env.local`:
```
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 7. Database Updates

```sql
-- Add Stripe fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_status text;
```

## 8. Testing

### Test Cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires auth: `4000 0025 0000 3155`

### Webhook Testing:
```bash
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

## 9. App Store Requirements

### iOS:
- Add In-App Purchase capability in Xcode
- Submit for App Store review with IAP items

### Android:
- Configure Google Play Console
- Set up merchant account

## 10. Security Checklist

✅ Never expose secret keys in client code
✅ Always validate webhooks signatures
✅ Use HTTPS for all API calls
✅ Implement rate limiting
✅ Log all payment events
✅ Set up Stripe Radar for fraud protection

## Revenue Share Considerations

Apple/Google take 15-30% commission on in-app purchases. Consider:
- Using Stripe for web subscriptions
- Directing users to web for signup
- Offering discounts for direct subscriptions