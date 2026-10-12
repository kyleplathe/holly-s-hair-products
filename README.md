# Holly's Hair Products

A one-page shop for Holly's salon clients. Most people will open it from a text or a QR code at the station. The bag, quantities, and all three ways to get the order (pickup, local delivery, shipping) work in the browser. Nothing is charged on the page.

Kyle can change the whole shop from one file, [`site.js`](site.js), while sitting with Holly.

## Edit the shop

Open `site.js` in a plain-text editor (Cursor, VS Code, or TextEdit set to plain text). Do not use Word. Change a value, save, and refresh the page.

Prices are dollars. `28` means $28. `24.5` means $24.50. `"$28"` also works.

Keep the straight quotes. Do not add a comma after the last item in a list. If the page goes blank, undo the last edit. A missing comma or quote is the usual cause. The burgundy bar at the top will also name a missing name or price.

What lives in `site.js`:

- Business name, tagline, and the optional announcement bar
- Every product: name, description, size, price, photo, and the Placeholder badge
- Pickup, local delivery, and shipping, including the fees
- About, how it works, FAQ, phone, email, and the booking link
- Pay at the salon wording, each product's Square link, and an optional order-level Square link

To add a product, copy one whole product block and change `id` to a new word with no spaces (`leave-in`, not `leave in`). To hide a product without deleting it, add `"available": false`.

Fees are edited in one place. `fee` is dollars added at checkout. `0` means free. `needsAddress: true` asks for an address. Changing a fee updates the homepage, the how-it-works cards, and the checkout total together.

`maxPerProduct` caps how many of one item a person can add (12 unless you change it).

## Run it on your computer

Opening `index.html` directly works. Or, from this folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

Check the cart math with:

```bash
node test/pricing.test.js
```

## Swap in real photos

1. Put a JPG or PNG in the `images` folder. About 800 pixels wide is enough. Keep the file under roughly 500 KB so the page stays fast on a phone. The frame crops to a tall rectangle.
2. In that product's block, set `image` to the file, for example `"images/shampoo.jpg"`.
3. Rewrite `imageAlt` to describe the photo.
4. Set `badge` to `""` when it is no longer a sample.

Filenames should have no spaces.

## Orders

The bag is saved in the browser (`localStorage`) until checkout. Checkout asks for a name and a phone or email.

- **Pick up at the salon** is the default. The fee is $0 unless you change it in `site.js`. No address.
- **Local delivery** adds the delivery fee and asks for an address. The zone note is the line under that option.
- **Ship it** adds the flat shipping fee and asks for an address.

The total is subtotal plus the selected fee. Tax is not calculated. See below.

Placing an order request does not charge a card. The confirmation shows the order number and the total. It also offers:

- **Copy order details**, to paste into a text
- **Email this order to Holly**, which opens an email to `contact.email` (or `contact.orderEmail` if that is set)
- **Pay at the salon**, for pickup orders, on Holly's Square reader
- **Pay now with Square**, when a Square payment link in `site.js` matches this bag

A copy of the request is saved in that browser. Holly is not notified until someone emails it, or until `contact.formEndpoint` is filled in.

`formEndpoint` is optional. Paste a Formspree (or similar) URL that accepts a JSON POST. Leave it as `""` to skip. Do not put API keys in this repo. The posted JSON includes the order number, items, fees, total, customer, fulfillment choice, and address when one was required.

## Payments with Square

Holly already uses Square at the chair. This page is the order pad. Square is the card machine. Pickup orders offer **Pay at the salon** (her Square reader). Nothing on this page asks for a card number.

**Pay now with Square** appears when a public Square payment link is pasted into `site.js`. The button opens that link. Leave the links as `""` until they exist. Do not invent a URL.

### Create a Square payment link

1. Sign in to the [Square Dashboard](https://app.squareup.com/dashboard/).
2. Open **Online → Checkout links / Payment links**. Square sometimes labels the same screen **Payments & orders**, **Payments & invoices**, or **Payments → Payment links**. Choose **Payment links**, then **Create link**.
3. Choose **Sell an item** and pick the product from Holly's Square item library. That keeps the price and the stock count in Square. This website does not track inventory. Use **Collect a payment** only for a one-off amount that is not a stocked item.
4. Save, then copy the public link. It looks like `https://square.link/u/...`.
5. Paste that link into `site.js` and save.

Where to paste it:

- **One product.** Put the URL in that product's `squareLink`. Checkout uses it when the bag contains only that product (even if the quantity is more than one). A reusable link is often a fixed amount for one unit, so a quantity over one may not match the total on this page. The note under the button says so.
- **A whole order.** Put one URL in `payment.squareLink`. Mixed bags, and any bag whose product has no `squareLink`, use this order-level link. Holly can create that link for a custom total, or send a Square invoice for that order. The request on this page is still the packing list.

If a bag has more than one product and only per-product links are filled in, checkout does not open one of those links. It explains that a Square link here pays for one product at a time, and it falls back to **Pay at pickup**.

Keep stock in Square. When the payment link sells an item from the item library, Square decrements that item. Update quantities in the Square item library, not in this repo.

Never paste a Square access token, application secret, or personal access token into `site.js` or this repo. Payment links are public URLs. Tokens are not.

### If she wants the cart inside Square

Square Online's free plan is an alternative if Holly later wants full automatic checkout: a Square-hosted shop that charges the card, applies her Square items, and can calculate tax and shipping. This page can stay the short list she texts from the salon either way. The free plan does not have to replace it.

### Minnesota sales tax

This is not tax advice. Holly should confirm it with the [Minnesota Department of Revenue](https://www.revenue.state.mn.us/) or a preparer.

Retail hair products are generally taxable in Minnesota. Shampoo and other grooming products are called out as taxable, and beauty product sales (including hair products) are taxable even though salon services such as the haircut itself are not. The state general rate is 6.875%, and cities or counties can add local tax. The rate depends on where the customer receives the product: the salon for pickup, the delivery address for delivery or shipping. The Department of Revenue also describes a resale exemption (Form ST3) for products bought to resell. Confirm that before relying on it.

Useful pages:

- [Barber shop, salon, and spa services](https://www.revenue.state.mn.us/guide/barber-shop-salon-and-spa-services)
- [Grooming and hygiene products](https://www.revenue.state.mn.us/guide/grooming-and-hygiene-products)
- [Taxes and rates](https://www.revenue.state.mn.us/guide/taxes-and-rates), including the [sales tax rate calculator](https://www.revenue.state.mn.us/sales-tax-rate-calculator)

Minnesota also has a retail delivery fee on some delivered retail orders. Smaller sellers are often under the threshold and do not collect it. Confirm the current rule before adding it on top of Holly's own delivery fee. This prototype does not add tax or that fee. The delivery and shipping numbers in `site.js` are Holly's own fees.

## Put it on the internet

The site is static files. There is no build step. Either host serves the folder as-is.

### Cloudflare Pages

This is the best fit for a `pages.dev` link you can text to Holly.

1. In the [Cloudflare dashboard](https://dash.cloudflare.com/), create an API token with the **Cloudflare Pages: Edit** permission, and copy the account ID from the dashboard URL or the Workers overview.
2. Either connect this GitHub repo (Workers & Pages → Create → Pages → Connect to Git, framework **None**, build command empty, output directory `/`), or deploy from your computer:

```bash
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
bash scripts/deploy-cloudflare.sh
```

The project name is `hollys-hair-products`, so the live URL is `https://hollys-hair-products.pages.dev` once that name is free on the account. If Cloudflare says the name is taken, run:

```bash
CLOUDFLARE_PAGES_PROJECT=hollys-salon-shelf bash scripts/deploy-cloudflare.sh
```

3. To deploy on every push to `main`, add repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The workflow [`.github/workflows/cloudflare-pages.yml`](.github/workflows/cloudflare-pages.yml) publishes the site. Without those secrets it skips instead of failing.

`_headers` is included so Cloudflare sends a long cache time for the fonts.

### GitHub Pages

1. Merge to `main`.
2. In the repo, open Settings → Pages → Build and deployment, and set Source to **GitHub Actions**.
3. The workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes the site.
4. The address will be `https://kyleplathe.github.io/holly-s-hair-products/`.

Paths are relative, so the same files work on your computer, on GitHub project pages, and on a `pages.dev` host.

## Files

| File | What it is |
| --- | --- |
| `site.js` | Everything Holly and Kyle edit |
| `index.html` | Page shell |
| `styles.css` | Look and layout |
| `app.js` | Bag, checkout, and the order request |
| `pricing.js` | Totals, so the fee math stays in one place |
| `images/` | Placeholder art, then real photos |
| `fonts/` | Fraunces and Outfit, with their SIL licenses |
| `test/pricing.test.js` | Checks pickup, delivery, and shipping totals |
