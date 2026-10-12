"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const Pricing = require("../pricing.js");

function moneyOrder(cart, fulfillmentId) {
  const products = [
    { id: "shampoo", name: "Shampoo", price: 28, size: "8.5 oz" },
    { id: "oil", name: "Hair Oil", price: 19.99, size: "1 oz" }
  ];
  const fulfillment = [
    { id: "pickup", label: "Pick up at the salon", fee: 0, isDefault: true, needsAddress: false },
    { id: "delivery", label: "Local delivery", fee: 5, needsAddress: true },
    { id: "shipping", label: "Ship it", fee: 8, needsAddress: true }
  ];
  return Pricing.buildOrder(cart, products, fulfillment, fulfillmentId);
}

const pickup = moneyOrder({ shampoo: 2, oil: 3 }, "pickup");
assert.strictEqual(pickup.subtotalCents, 5600 + 5997);
assert.strictEqual(pickup.feeCents, 0);
assert.strictEqual(pickup.totalCents, 11597);
assert.strictEqual(pickup.fulfillment.id, "pickup");

const delivery = moneyOrder({ shampoo: 2, oil: 3 }, "delivery");
assert.strictEqual(delivery.feeCents, 500);
assert.strictEqual(delivery.totalCents, 12097);

const shipping = moneyOrder({ shampoo: 2, oil: 3 }, "shipping");
assert.strictEqual(shipping.feeCents, 800);
assert.strictEqual(shipping.totalCents, 12397);

const fallback = moneyOrder({ shampoo: 1 }, "nope");
assert.strictEqual(fallback.fulfillment.id, "pickup");
assert.strictEqual(fallback.totalCents, 2800);

const emptyShip = moneyOrder({}, "shipping");
assert.strictEqual(emptyShip.lines.length, 0);
assert.strictEqual(emptyShip.totalCents, 800);

const ignored = moneyOrder({ missing: 4, shampoo: "2" }, "pickup");
assert.strictEqual(ignored.lines.length, 1);
assert.strictEqual(ignored.lines[0].qty, 2);
assert.strictEqual(ignored.subtotalCents, 5600);

assert.strictEqual(Pricing.toCents(19.99), 1999);
assert.strictEqual(Pricing.toCents("24.50"), 2450);
assert.strictEqual(Pricing.toCents("$8"), 800);
assert.strictEqual(Pricing.toCents(0), 0);
assert.strictEqual(Pricing.toCents(-3), 0);
assert.strictEqual(Pricing.normalizeQty(20, 12), 12);
assert.strictEqual(Pricing.normalizeQty(0, 12), 0);
assert.strictEqual(Pricing.feeLabel(0), "Free");
assert.strictEqual(Pricing.formatMoney(11597), "$115.97");
assert.strictEqual(Pricing.dollarsString(9100), "91.00");

const products = [
  { id: "a", paymentLink: "https://pay.example/a" },
  { id: "b", paymentLink: "https://pay.example/b" }
];
assert.deepStrictEqual(
  Pricing.resolvePaymentLink([{ id: "a" }], products, { paymentLink: "https://pay.example/shop" }),
  { href: "https://pay.example/a", source: "product" }
);
assert.deepStrictEqual(
  Pricing.resolvePaymentLink([{ id: "a" }, { id: "b" }], products, { paymentLink: "https://pay.example/shop" }),
  { href: "https://pay.example/shop", source: "shop" }
);
assert.deepStrictEqual(
  Pricing.resolvePaymentLink([{ id: "a" }, { id: "b" }], products, { paymentLink: "" }),
  { href: "", source: "none" }
);

const text = Pricing.formatOrderText(delivery, {
  name: "Sam Client",
  phone: "555-010-0199",
  email: "sam@example.com",
  address: { line1: "12 Oak St", line2: "", city: "Minneapolis", state: "MN", postal: "55401" }
}, { businessName: "Holly's Hair Products", taxNote: "Tax later." });
assert.ok(text.includes("Total: $120.97"));
assert.ok(text.includes("Local delivery: $5.00"));
assert.ok(text.includes("12 Oak St, Minneapolis, MN, 55401"));
assert.ok(text.includes("Tax later."));

const context = { window: {}, console: console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../site.js"), "utf8"), context);
const site = context.window.SITE;
assert.strictEqual(Pricing.validateSite(site).length, 0);
assert.ok(site.products.length >= 6);
["pickup", "delivery", "shipping"].forEach(function (id) {
  assert.ok(site.fulfillment.some(function (option) { return option.id === id; }));
});
const pickupOption = site.fulfillment.find(function (option) { return option.id === "pickup"; });
const deliveryOption = site.fulfillment.find(function (option) { return option.id === "delivery"; });
const shippingOption = site.fulfillment.find(function (option) { return option.id === "shipping"; });
assert.strictEqual(pickupOption.needsAddress, false);
assert.strictEqual(pickupOption.isDefault, true);
assert.strictEqual(deliveryOption.needsAddress, true);
assert.strictEqual(shippingOption.needsAddress, true);

const sample = Pricing.buildOrder(
  { shampoo: 2, conditioner: 1 },
  site.products,
  site.fulfillment,
  "delivery"
);
const shampoo = site.products.find(function (product) { return product.id === "shampoo"; });
const conditioner = site.products.find(function (product) { return product.id === "conditioner"; });
const expectedSubtotal = Pricing.toCents(shampoo.price) * 2 + Pricing.toCents(conditioner.price);
assert.strictEqual(sample.subtotalCents, expectedSubtotal);
assert.strictEqual(sample.feeCents, Pricing.toCents(deliveryOption.fee));
assert.strictEqual(sample.totalCents, expectedSubtotal + Pricing.toCents(deliveryOption.fee));
assert.strictEqual(
  Pricing.buildOrder({ shampoo: 2, conditioner: 1 }, site.products, site.fulfillment, "pickup").totalCents,
  expectedSubtotal + Pricing.toCents(pickupOption.fee)
);
assert.strictEqual(
  Pricing.buildOrder({ shampoo: 2, conditioner: 1 }, site.products, site.fulfillment, "shipping").totalCents,
  expectedSubtotal + Pricing.toCents(shippingOption.fee)
);

console.log("pricing tests passed");
