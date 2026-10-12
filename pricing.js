/* Cart math for Holly's shop.
   The page uses this file. You do not need to edit it to change prices.
   Change prices in site.js. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.Pricing = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function toCents(value) {
    var input = value;
    if (typeof input === "string") input = input.trim().replace(/\$/g, "").replace(/,/g, "");
    var amount = typeof input === "number" ? input : Number(input);
    if (!Number.isFinite(amount) || amount <= 0) return 0;
    return Math.round((amount + Number.EPSILON) * 100);
  }

  function formatMoney(cents) {
    var value = (Number(cents) || 0) / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  }

  function feeLabel(cents) {
    return cents === 0 ? "Free" : formatMoney(cents);
  }

  function dollarsString(cents) {
    var amount = Number(cents) || 0;
    var sign = amount < 0 ? "-" : "";
    var abs = Math.abs(Math.round(amount));
    return sign + Math.floor(abs / 100) + "." + String(abs % 100).padStart(2, "0");
  }

  function normalizeQty(qty, max) {
    var n = Math.floor(Number(qty));
    if (!Number.isFinite(n) || n <= 0) return 0;
    var cap = Number(max);
    if (!Number.isFinite(cap) || cap <= 0) cap = 99;
    return Math.min(n, Math.floor(cap));
  }

  function selectFulfillment(options, id) {
    var list = Array.isArray(options) ? options : [];
    var i;
    for (i = 0; i < list.length; i += 1) {
      if (list[i] && list[i].id === id) return list[i];
    }
    for (i = 0; i < list.length; i += 1) {
      if (list[i] && list[i].isDefault) return list[i];
    }
    return list[0] || null;
  }

  function buildOrder(cart, products, fulfillmentOptions, fulfillmentId) {
    var list = Array.isArray(products) ? products : [];
    var byId = {};
    list.forEach(function (product) {
      if (product && product.id) byId[product.id] = product;
    });
    var lines = [];
    var entries = cart && typeof cart === "object" ? Object.keys(cart) : [];
    entries.forEach(function (id) {
      var product = byId[id];
      var quantity = normalizeQty(cart[id], 99);
      if (!product || quantity <= 0) return;
      var unitCents = toCents(product.price);
      lines.push({
        id: id,
        name: product.name,
        size: product.size || "",
        qty: quantity,
        unitCents: unitCents,
        lineCents: unitCents * quantity
      });
    });
    var fulfillment = selectFulfillment(fulfillmentOptions, fulfillmentId);
    var subtotalCents = lines.reduce(function (sum, line) {
      return sum + line.lineCents;
    }, 0);
    var feeCents = fulfillment ? toCents(fulfillment.fee) : 0;
    return {
      lines: lines,
      fulfillment: fulfillment,
      subtotalCents: subtotalCents,
      feeCents: feeCents,
      totalCents: subtotalCents + feeCents
    };
  }

  function resolvePaymentLink(lines, products, payment) {
    var byId = {};
    (products || []).forEach(function (product) {
      if (product && product.id) byId[product.id] = product;
    });
    var orderLink = payment && typeof payment.squareLink === "string" ? payment.squareLink.trim() : "";
    var lineList = Array.isArray(lines) ? lines : [];
    var linked = [];
    lineList.forEach(function (line) {
      if (!line || !line.id) return;
      var product = byId[line.id];
      var href = product && typeof product.squareLink === "string" ? product.squareLink.trim() : "";
      if (href) linked.push(href);
    });
    if (lineList.length === 1 && linked.length === 1) {
      return { href: linked[0], source: "product", limited: false };
    }
    if (lineList.length > 0 && orderLink) {
      return { href: orderLink, source: "order", limited: false };
    }
    if (lineList.length > 1 && linked.length > 0) {
      return { href: "", source: "multi", limited: true };
    }
    return { href: "", source: "none", limited: false };
  }

  function formatOrderText(order, customer, extra) {
    var lines = [];
    lines.push((extra && extra.businessName) || "Order");
    if (order.number) lines.push("Order " + order.number);
    lines.push("");
    (order.lines || []).forEach(function (line) {
      var size = line.size ? " (" + line.size + ")" : "";
      lines.push(line.qty + " x " + line.name + size + " - " + formatMoney(line.lineCents));
    });
    lines.push("");
    lines.push("Subtotal: " + formatMoney(order.subtotalCents));
    var fulfillmentName = order.fulfillment ? order.fulfillment.label : "Fulfillment";
    lines.push(fulfillmentName + ": " + feeLabel(order.feeCents));
    lines.push("Total: " + formatMoney(order.totalCents));
    if (extra && extra.taxNote) {
      lines.push("");
      lines.push(extra.taxNote);
    }
    lines.push("");
    lines.push("Name: " + ((customer && customer.name) || ""));
    if (customer && customer.phone) lines.push("Phone: " + customer.phone);
    if (customer && customer.email) lines.push("Email: " + customer.email);
    if (customer && customer.note) lines.push("Note: " + customer.note);
    if (order.fulfillment && order.fulfillment.needsAddress && customer && customer.address) {
      var address = customer.address;
      var street = [address.line1, address.line2].filter(Boolean).join(", ");
      var place = [street, address.city, address.state, address.postal].filter(Boolean).join(", ");
      lines.push("Address: " + place);
    }
    return lines.join("\n");
  }

  function validateSite(site) {
    var errors = [];
    if (!site || typeof site !== "object") return ["site.js did not load."];
    if (!site.businessName) errors.push("Add a businessName in site.js.");
    if (!Array.isArray(site.products) || site.products.length === 0) {
      errors.push("Add at least one product in site.js.");
    } else {
      var ids = {};
      site.products.forEach(function (product, index) {
        var label = product && (product.name || product.id) ? (product.name || product.id) : "Product " + (index + 1);
        if (!product || !product.id) errors.push(label + " needs an id.");
        else if (ids[product.id]) errors.push("Duplicate product id: " + product.id + ".");
        else ids[product.id] = true;
        if (!product || !product.name) errors.push((product && product.id ? product.id : "A product") + " needs a name.");
        if (!product || product.price == null || product.price === "") errors.push(label + " needs a price.");
      });
    }
    if (!Array.isArray(site.fulfillment) || site.fulfillment.length === 0) {
      errors.push("Add pickup, delivery, and shipping in site.js.");
    } else {
      site.fulfillment.forEach(function (option) {
        var name = option && option.label ? option.label : "A fulfillment option";
        if (!option || !option.id || !option.label) errors.push("Each fulfillment option needs an id and a label.");
        if (!option || option.fee == null || option.fee === "") errors.push(name + " needs a fee. Use 0 for free.");
      });
    }
    return errors;
  }

  return {
    toCents: toCents,
    formatMoney: formatMoney,
    feeLabel: feeLabel,
    dollarsString: dollarsString,
    normalizeQty: normalizeQty,
    selectFulfillment: selectFulfillment,
    buildOrder: buildOrder,
    resolvePaymentLink: resolvePaymentLink,
    formatOrderText: formatOrderText,
    validateSite: validateSite
  };
});
