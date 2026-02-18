# Paystack Integration Setup

## Getting Your Test API Keys

1. **Create a Paystack Account** (if you don't have one)
   - Go to [https://paystack.com](https://paystack.com)
   - Sign up for a free account

2. **Get Your Test Public Key**
   - Login to your Paystack Dashboard
   - Go to **Settings** → **API Keys & Webhooks**
   - Copy your **Test Public Key** (starts with `pk_test_`)

3. **Update Your Code**
   - Open `checkout.js`
   - Find line 3: `const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';`
   - Replace the placeholder with your actual test public key

## Testing the Payment

### Test Cards (Use these in the Paystack popup):

**Successful Payment:**
- Card Number: `4084084084084081`
- Expiry: Any future date (e.g., `12/30`)
- CVV: `408`
- PIN: `0000`
- OTP: `123456`

**Failed Payment:**
- Card Number: `5060666666666666666`

**Insufficient Funds:**
- Card Number: `5061025541131342`

### Test Flow:
1. Add items to cart (tickets or food)
2. Click "Checkout"
3. Fill in contact details (use real email to receive test receipt)
4. Click "Proceed to Payment"
5. Paystack popup opens
6. Enter test card details above
7. Complete payment flow
8. Success modal shows with booking reference
9. Cart clears automatically

## Important Notes:

- **Test Mode**: This integration uses test keys - no real money will be charged
- **Production**: Before going live, replace `pk_test_` key with your `pk_live_` key
- **Security**: Never commit your live keys to public repositories
- **Webhooks**: For production, set up webhooks to verify payments on your backend

## Paystack Documentation:
- [Paystack Test Cards](https://paystack.com/docs/payments/test-payments/#test-cards)
- [Paystack Inline Documentation](https://paystack.com/docs/payments/accept-payments/#popup)

---

**Current Implementation:**
- ✅ Paystack Inline JS included
- ✅ Payment initialization with cart total
- ✅ Service fee calculated (5%)
- ✅ Customer metadata sent
- ✅ Success callback handling
- ✅ Cart clearing on success
- ✅ Booking reference generation
