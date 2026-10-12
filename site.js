/* Holly's Hair Products
   --------------------
   This is the only file you need to edit for the shop.
   Change a value, save, and refresh the page.

   Prices are dollars. 28 means $28. 24.5 means $24.50. "$28" also works.
   Keep the straight quotes. Do not add a comma after the last item in a list.
   If the page goes blank, undo the last edit (a comma or quote is usually the cause).

   Photos live in the images folder. Point "image" at the file, for example
   "images/shampoo.jpg". Then clear "badge" (set it to "") when it is a real product.
*/

window.SITE = {
  "businessName": "Holly's Hair Products",
  "stylistName": "Holly",
  "location": "Minnesota",
  "eyebrow": "From the salon chair",
  "tagline": "The products Holly uses in the chair, ready for you to take home.",
  "announcement": "",

  "hero": {
    "primary": "Shop the shelf",
    "secondary": "How it works"
  },

  "shop": {
    "heading": "The shelf",
    "intro": "These six cards are placeholders, so you can click through the shop before the real products are in. Names, sizes, prices, and photos all live in site.js.",
    "maxPerProduct": 12
  },

  "about": {
    "heading": "About Holly",
    "quote": "If it earns a spot at the station, it can go home with you.",
    "paragraphs": [
      "Placeholder bio. Holly is a local stylist. This shop is for her own clients, not a big catalog: a short list of products she actually uses in the chair.",
      "Replace these sentences with Holly's own words. Where she works, who she likes working with, and how she wants people to order."
    ]
  },

  "how": {
    "heading": "How it works",
    "intro": "Order from your phone at the station, or from a link Holly texts you. She packs it."
  },

  /* fee is dollars added at checkout. 0 means free.
     needsAddress: true asks for an address.
     Change a fee here and the shop, the how-it-works cards, and checkout all update. */
  "fulfillment": [
    {
      "id": "pickup",
      "label": "Pick up at the salon",
      "detail": "At my next appointment, or at the salon station.",
      "fee": 0,
      "zoneNote": "",
      "needsAddress": false,
      "isDefault": true,
      "how": "Place a request, then grab the bag at your next visit or at Holly's station."
    },
    {
      "id": "delivery",
      "label": "Local delivery",
      "detail": "Holly delivers it herself.",
      "fee": 5,
      "zoneNote": "Within about 15 minutes of the salon. Text Holly if you are not sure.",
      "needsAddress": true,
      "how": "Holly drops orders off near the salon. Add an address at checkout. She will confirm before she heads out."
    },
    {
      "id": "shipping",
      "label": "Ship it",
      "detail": "A flat rate, mailed to you.",
      "fee": 8,
      "zoneNote": "Ships within the United States.",
      "needsAddress": true,
      "how": "Holly can mail a box. The flat shipping rate is added before you place the request. She confirms before anything ships."
    }
  ],

  "faq": {
    "heading": "Questions",
    "items": [
      {
        "q": "Is this a real charge?",
        "a": "Not on this page. Placing an order request tells Holly what you want. You can pay at pickup, or use a payment link if she has added one. This page never asks for a card number."
      },
      {
        "q": "When is pickup ready?",
        "a": "Holly will confirm. If you already have an appointment, ask her to set the bag at her station."
      },
      {
        "q": "What if I need to change an order?",
        "a": "Text or call Holly and give her the order number. She can change it before she packs the bag."
      },
      {
        "q": "Do prices include tax?",
        "a": "No. Prices are the product prices only. Retail hair products are generally taxable in Minnesota. Holly will confirm any tax before you pay."
      }
    ]
  },

  "contact": {
    "heading": "Say hello",
    "text": "Text or email Holly. For an appointment, use the booking link.",
    "phone": "(555) 010-0142",
    "email": "holly@example.com",
    "orderEmail": "",
    "formEndpoint": "",
    "bookingUrl": "https://example.com/book",
    "bookingLabel": "Book with Holly",
    "bookingNote": "Placeholder link. Paste Holly's real booking page into site.js.",
    "instagram": ""
  },

  /* PAYMENT
     Leave paymentLink as "" to only offer pay at pickup.
     Later, paste a Square or Stripe Payment Link between the quotes.
     That link is public. Never paste a secret key in this file.
     A link on one product (paymentLink on that product) is used only when
     the bag contains just that product. The shop link is used for any other bag.
     A reusable link often has a fixed amount, so it may not match a mixed bag
     until Holly sends a per-order Square invoice or payment link. */
  "payment": {
    "payAtPickup": true,
    "payAtPickupTitle": "Pay at pickup",
    "payAtPickupText": "Nothing is charged on this page. Pay Holly at the salon, or when she hands off a delivery, with the card reader or cash you already use.",
    "paymentLink": "",
    "paymentLinkLabel": "Pay now",
    "paymentLinkNote": "Opens a Square or Stripe payment link. A reusable link may be a fixed amount, so check that it matches this total."
  },

  "taxNote": "Tax is not added on this page. Retail hair products are generally taxable in Minnesota. Holly will confirm any tax before you pay.",
  "footerNote": "Sample shop for Holly's clients. Product names, prices, and photos are placeholders until they are edited in site.js.",

  /* Copy a whole product block to add another.
     id must be unique and contain no spaces.
     To hide a product without deleting it, add "available": false */
  "products": [
    {
      "id": "shampoo",
      "name": "Shampoo",
      "description": "Placeholder product. A gentle daily cleanse. Replace this text in site.js.",
      "size": "8.5 oz",
      "price": 28,
      "image": "images/shampoo.svg",
      "imageAlt": "Placeholder illustration of a shampoo bottle",
      "swatch": "#E5EEE7",
      "badge": "Placeholder",
      "paymentLink": ""
    },
    {
      "id": "conditioner",
      "name": "Conditioner",
      "description": "Placeholder product. The matching daily conditioner. Replace this text in site.js.",
      "size": "8.5 oz",
      "price": 30,
      "image": "images/conditioner.svg",
      "imageAlt": "Placeholder illustration of a conditioner bottle",
      "swatch": "#E3EAF2",
      "badge": "Placeholder",
      "paymentLink": ""
    },
    {
      "id": "styling-cream",
      "name": "Styling Cream",
      "description": "Placeholder product. A soft-hold cream. Replace this text in site.js.",
      "size": "4 oz",
      "price": 26,
      "image": "images/styling-cream.svg",
      "imageAlt": "Placeholder illustration of a styling cream jar",
      "swatch": "#F4EBDD",
      "badge": "Placeholder",
      "paymentLink": ""
    },
    {
      "id": "hair-oil",
      "name": "Hair Oil",
      "description": "Placeholder product. A few drops for shine. Replace this text in site.js.",
      "size": "1.7 oz",
      "price": 34,
      "image": "images/hair-oil.svg",
      "imageAlt": "Placeholder illustration of a hair oil bottle",
      "swatch": "#F8EBD4",
      "badge": "Placeholder",
      "paymentLink": ""
    },
    {
      "id": "heat-protectant",
      "name": "Heat Protectant",
      "description": "Placeholder product. Spray it on before heat tools. Replace this text in site.js.",
      "size": "5 oz",
      "price": 24,
      "image": "images/heat-protectant.svg",
      "imageAlt": "Placeholder illustration of a heat protectant spray bottle",
      "swatch": "#F8E7E3",
      "badge": "Placeholder",
      "paymentLink": ""
    },
    {
      "id": "dry-shampoo",
      "name": "Dry Shampoo",
      "description": "Placeholder product. For the day between washes. Replace this text in site.js.",
      "size": "4.3 oz",
      "price": 22,
      "image": "images/dry-shampoo.svg",
      "imageAlt": "Placeholder illustration of a dry shampoo can",
      "swatch": "#EEEAE3",
      "badge": "Placeholder",
      "paymentLink": ""
    }
  ]
};
