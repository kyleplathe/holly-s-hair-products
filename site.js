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
        "a": "Not on this page. Placing an order request tells Holly what you want. Pickup can be paid at the salon on Holly's Square reader. If a Square payment link is set up, you can also pay now with Square. This page never asks for a card number."
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

  /* PAYMENT — Holly uses Square.
     squareLink on a product is that product's Square payment link.
     payment.squareLink is optional. It covers a whole order, including a mixed bag.
     Leave both as "" and pickup only offers pay at the salon, on Holly's Square reader.
     Paste the public link only (it looks like https://square.link/u/...).
     Never paste a Square access token.
     One product in the bag uses that product's squareLink.
     More than one product cannot be combined into those per-product links.
     A mixed bag uses payment.squareLink if it is set. Otherwise checkout
     explains that and falls back to pay at pickup.
     A reusable Square link is often one unit at a fixed amount. */
  "payment": {
    "payAtSalonTitle": "Pay at the salon",
    "payAtSalonText": "Nothing is charged on this page. Pay Holly at the salon with her Square reader when you pick up.",
    "squareLink": "",
    "squareLinkLabel": "Pay now with Square",
    "squareLinkNote": "Opens a Square payment link. A reusable link is often a fixed amount for one unit, so check that it matches this total.",
    "multiItemTitle": "Pay at pickup",
    "multiItemNote": "A Square link on this page pays for one product at a time. This bag has more than one product, so pay at pickup instead.",
    "checkoutSalon": "Pay at the salon with Holly's Square reader.",
    "checkoutSalonAndSquare": "Pay at the salon with Holly's Square reader, or pay now with Square.",
    "checkoutSquare": "Pay now with Square.",
    "checkoutMulti": "This bag has more than one product. Pay at pickup. A Square link covers one product at a time.",
    "payLaterText": "Nothing is charged on this page. Holly will confirm payment when she gets this request."
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
      "squareLink": ""
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
      "squareLink": ""
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
      "squareLink": ""
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
      "squareLink": ""
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
      "squareLink": ""
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
      "squareLink": ""
    }
  ]
};
