# Sacrosys iChef connection setup

The Chick Buck backend sends an order to the POS **only after a Razorpay payment is verified**. The connection is intentionally disabled until Sacrosys supplies the real integration details.


## Ask Sacrosys for these values

- API/webhook URL for creating an online **Home Delivery** order
- Authentication type and API key/token
- Outlet/store ID for each Chick Buck branch
- iChef item IDs for every menu product
- iChef modifier IDs for mayo, ketchup, khubz and other add-ons
- Required JSON payload example and success response example
- Test outlet or sandbox credentials

## Add their values to `.env`

```env
ICHEF_API_URL=https://provided-by-sacrosys.example/orders
ICHEF_API_KEY=provided-by-sacrosys
ICHEF_API_TIMEOUT_MS=5000
```

Never place the API key in `menu.html`, Netlify frontend variables, screenshots, or WhatsApp. It belongs only in the secure backend `.env` file.

## What Chick Buck sends after successful payment

- Chick Buck order ID
- Order type: `DELIVERY` or `TABLE`
- Branch outlet ID
- Table number or delivery details
- Customer name, phone, address and GPS coordinates
- Ordered items, quantities and add-on/special requests
- Final paid total and payment status

## Before going live

1. Map each Chick Buck menu item to the exact Sacrosys/iChef item ID.
2. Make one small paid test order using their test environment.
3. Confirm the order appears as **Home Delivery** in iChef.
4. Confirm a kitchen order ticket prints only once.
5. Confirm an invalid or failed payment never prints a KOT.
