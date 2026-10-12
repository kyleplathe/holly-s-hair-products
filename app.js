/* Shop behavior. Edit site.js, not this file, unless you are changing how the page works. */
(function () {
  "use strict";

  if (!window.SITE || !window.Pricing) {
    var bootEarly = document.getElementById("boot-error");
    if (bootEarly && !window.Pricing) {
      bootEarly.hidden = false;
      bootEarly.textContent = "pricing.js did not load.";
    }
    document.body.classList.add("is-ready");
    return;
  }

  var SITE = window.SITE;
  var Pricing = window.Pricing;
  var dialog = document.getElementById("cart-dialog");
  var STORAGE_KEY = "hollys-hair-cart";
  var ORDERS_KEY = "hollys-hair-orders";
  var cart = {};
  var step = "cart";
  var lastOrder = null;
  var draft = {
    name: "",
    phone: "",
    email: "",
    note: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal: "",
    fulfillmentId: ""
  };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    var props = attrs || {};
    Object.keys(props).forEach(function (key) {
      var value = props[key];
      if (value == null || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = String(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    (children || []).forEach(function (child) {
      if (child != null) node.append(child);
    });
    return node;
  }

  function visibleProducts() {
    return (SITE.products || []).filter(function (product) {
      return product && product.id && product.name && product.available !== false;
    });
  }

  function productById(id) {
    var products = visibleProducts();
    for (var i = 0; i < products.length; i += 1) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  function maxPerProduct() {
    var n = Number(SITE.shop && SITE.shop.maxPerProduct);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 12;
  }

  function defaultFulfillmentId() {
    var selected = Pricing.selectFulfillment(SITE.fulfillment || [], null);
    return selected ? selected.id : "";
  }

  function cartCount() {
    return Object.keys(cart).reduce(function (sum, id) {
      return sum + cart[id];
    }, 0);
  }

  function currentFulfillment() {
    return Pricing.selectFulfillment(SITE.fulfillment || [], draft.fulfillmentId);
  }

  function currentOrder() {
    return Pricing.buildOrder(cart, visibleProducts(), SITE.fulfillment || [], draft.fulfillmentId);
  }

  function safeEmail(value) {
    var email = String(value || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "";
    return email;
  }

  function safeHttpUrl(value) {
    var raw = String(value || "").trim();
    if (!raw) return "";
    try {
      var url = new URL(raw, window.location.href);
      if (url.protocol === "http:" || url.protocol === "https:") return url.href;
    } catch (err) {
      return "";
    }
    return "";
  }

  function safeImage(value) {
    var raw = String(value || "").trim();
    if (!raw || /^\s*javascript:/i.test(raw)) return "";
    return raw;
  }

  function safeColor(value) {
    var color = String(value || "").trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) return color;
    return "";
  }

  function telHref(phone) {
    var digits = String(phone || "").replace(/[^\d+]/g, "");
    return digits ? "tel:" + digits : "";
  }

  function orderInbox() {
    var contact = SITE.contact || {};
    return safeEmail(contact.orderEmail) || safeEmail(contact.email);
  }

  function announce(message) {
    var region = document.getElementById("live-region");
    if (region) region.textContent = message;
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      /* Private browsing can block storage. The bag still works for this visit. */
    }
  }

  function loadCart() {
    cart = {};
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
      Object.keys(raw).forEach(function (id) {
        if (!productById(id)) return;
        var qty = Pricing.normalizeQty(raw[id], maxPerProduct());
        if (qty > 0) cart[id] = qty;
      });
    } catch (err) {
      cart = {};
    }
  }

  function saveOrder(order) {
    try {
      var existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
      var list = Array.isArray(existing) ? existing : [];
      list.unshift({
        number: order.number,
        createdAt: order.createdAt,
        text: order.text,
        totalCents: order.totalCents
      });
      localStorage.setItem(ORDERS_KEY, JSON.stringify(list.slice(0, 20)));
    } catch (err) {
      /* The confirmation still shows if storage is blocked. */
    }
  }

  function readDraftFromDom() {
    document.querySelectorAll("[data-draft]").forEach(function (input) {
      draft[input.dataset.draft] = input.value;
    });
    var checked = document.querySelector('input[name="fulfillment"]:checked');
    if (checked) draft.fulfillmentId = checked.value;
  }

  function customerFromDraft() {
    var state = draft.state.trim();
    if (state.length === 2) state = state.toUpperCase();
    return {
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      note: draft.note.trim(),
      address: {
        line1: draft.line1.trim(),
        line2: draft.line2.trim(),
        city: draft.city.trim(),
        state: state,
        postal: draft.postal.trim()
      }
    };
  }

  function renderAnnouncement() {
    var bar = document.getElementById("announcement");
    if (!bar) return;
    if (SITE.announcement) {
      bar.hidden = false;
      bar.textContent = SITE.announcement;
    } else {
      bar.hidden = true;
      bar.textContent = "";
    }
  }

  function renderNav() {
    var nav = document.getElementById("nav");
    [
      ["#shop", "Shop"],
      ["#about", "About"],
      ["#how", "How it works"],
      ["#faq", "FAQ"],
      ["#contact", "Contact"]
    ].forEach(function (link) {
      nav.append(el("a", { href: link[0], text: link[1] }));
    });
  }

  function renderHero() {
    var hero = document.getElementById("hero");
    var copy = el("div", { class: "hero-copy" });
    if (SITE.eyebrow) copy.append(el("p", { class: "eyebrow", text: SITE.eyebrow }));
    copy.append(el("h1", { id: "hero-title", text: SITE.businessName || "Shop" }));
    copy.append(el("p", { class: "lede", text: SITE.tagline || "" }));
    var actions = el("div", { class: "hero-actions" });
    actions.append(el("a", { class: "btn", href: "#shop", text: (SITE.hero && SITE.hero.primary) || "Shop the shelf" }));
    actions.append(el("a", { class: "btn btn-secondary", href: "#how", text: (SITE.hero && SITE.hero.secondary) || "How it works" }));
    copy.append(actions);
    var pills = el("ul", { class: "fee-pills" });
    (SITE.fulfillment || []).forEach(function (option) {
      pills.append(el("li", { text: option.label + " · " + Pricing.feeLabel(Pricing.toCents(option.fee)) }));
    });
    copy.append(pills);
    hero.append(copy);

    var collage = el("div", { class: "hero-collage", "aria-hidden": "true" });
    visibleProducts().slice(0, 3).forEach(function (product) {
      collage.append(el("img", {
        src: safeImage(product.image),
        alt: "",
        width: "400",
        height: "500"
      }));
    });
    hero.append(collage);

    document.title = SITE.businessName || document.title;
    var mark = document.getElementById("mark");
    if (mark) mark.textContent = (SITE.stylistName || SITE.businessName || "H").trim().charAt(0) || "H";
    var word = document.getElementById("wordmark");
    if (word) word.textContent = SITE.businessName || "Shop";
    var meta = document.querySelector('meta[name="description"]');
    if (meta && SITE.tagline) meta.setAttribute("content", SITE.tagline);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && SITE.businessName) ogTitle.setAttribute("content", SITE.businessName);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && SITE.tagline) ogDesc.setAttribute("content", SITE.tagline);
  }

  function stepper(id, qty, name) {
    var wrap = el("div", { class: "stepper" });
    wrap.append(el("button", {
      type: "button",
      "data-action": "dec",
      "data-id": id,
      "aria-label": "Decrease " + name + " quantity",
      text: "\u2212"
    }));
    var input = el("input", {
      "data-qty": id,
      type: "number",
      inputmode: "numeric",
      min: "0",
      max: String(maxPerProduct()),
      "aria-label": name + " quantity",
      value: String(qty)
    });
    input.value = String(qty);
    wrap.append(input);
    wrap.append(el("button", {
      type: "button",
      "data-action": "inc",
      "data-id": id,
      "aria-label": "Increase " + name + " quantity",
      text: "+"
    }));
    return wrap;
  }

  function productAction(product) {
    var qty = cart[product.id] || 0;
    if (qty <= 0) {
      return el("button", {
        type: "button",
        class: "btn",
        "data-action": "add",
        "data-id": product.id,
        text: "Add to bag"
      });
    }
    return stepper(product.id, qty, product.name);
  }

  function productCard(product) {
    var card = el("article", { class: "product-card" });
    var media = el("div", { class: "product-media" });
    var swatch = safeColor(product.swatch);
    if (swatch) media.style.background = swatch;
    var img = el("img", {
      src: safeImage(product.image),
      alt: product.imageAlt || product.name,
      width: "400",
      height: "500"
    });
    img.addEventListener("error", function () {
      img.replaceWith(el("div", { class: "img-fallback", text: product.name }));
    });
    media.append(img);
    if (product.badge) media.append(el("span", { class: "badge", text: product.badge }));
    card.append(media);
    var body = el("div", { class: "product-body" });
    body.append(el("h3", { class: "product-name", text: product.name }));
    if (product.description) body.append(el("p", { class: "product-desc", text: product.description }));
    var meta = el("div", { class: "product-meta" });
    if (product.size) meta.append(el("span", { text: product.size }));
    meta.append(el("span", { class: "product-price", text: Pricing.formatMoney(Pricing.toCents(product.price)) }));
    body.append(meta);
    body.append(productAction(product));
    card.append(body);
    return card;
  }

  function renderProducts() {
    var grid = document.getElementById("product-grid");
    grid.replaceChildren();
    var products = visibleProducts();
    if (!products.length) {
      grid.append(el("p", { text: "No products yet. Add some in site.js." }));
      return;
    }
    products.forEach(function (product) {
      grid.append(productCard(product));
    });
  }

  function renderAbout() {
    var about = SITE.about || {};
    var wrap = el("div", { class: "wrap about-grid" });
    var quoteWrap = el("div");
    if (about.quote) {
      var quote = el("blockquote", { class: "quote" });
      quote.append(el("p", { text: about.quote }));
      if (SITE.stylistName) quote.append(el("footer", { text: "\u2014 " + SITE.stylistName }));
      quoteWrap.append(quote);
    }
    wrap.append(quoteWrap);
    var copy = el("div");
    copy.append(el("h2", { id: "about-heading", text: about.heading || "About" }));
    (about.paragraphs || []).forEach(function (paragraph) {
      copy.append(el("p", { text: paragraph }));
    });
    wrap.append(copy);
    document.getElementById("about").append(wrap);
  }

  function renderHow() {
    var how = SITE.how || {};
    var wrap = el("div", { class: "wrap" });
    var head = el("div", { class: "section-head" });
    head.append(el("h2", { id: "how-heading", text: how.heading || "How it works" }));
    if (how.intro) head.append(el("p", { text: how.intro }));
    wrap.append(head);
    var grid = el("div", { class: "how-grid" });
    (SITE.fulfillment || []).forEach(function (option) {
      var card = el("article", { class: "how-card" });
      card.append(el("h3", { text: option.label }));
      card.append(el("p", { class: "how-fee", text: Pricing.feeLabel(Pricing.toCents(option.fee)) }));
      if (option.how || option.detail) card.append(el("p", { text: option.how || option.detail }));
      if (option.zoneNote) card.append(el("p", { class: "fine", text: option.zoneNote }));
      grid.append(card);
    });
    wrap.append(grid);
    document.getElementById("how").append(wrap);
  }

  function renderFaq() {
    var faq = SITE.faq || {};
    var wrap = el("div", { class: "wrap wrap-narrow" });
    wrap.append(el("h2", { id: "faq-heading", text: faq.heading || "Questions" }));
    var list = el("div", { class: "faq-list" });
    (faq.items || []).forEach(function (item) {
      var details = el("details", { class: "faq-item" });
      details.append(el("summary", { text: item.q || "" }));
      String(item.a || "").split(/\n\n/).forEach(function (paragraph) {
        if (paragraph.trim()) details.append(el("p", { text: paragraph.trim() }));
      });
      list.append(details);
    });
    wrap.append(list);
    document.getElementById("faq").append(wrap);
  }

  function renderContact() {
    var contact = SITE.contact || {};
    var card = el("div", { class: "contact-card" });
    card.append(el("h2", { id: "contact-heading", text: contact.heading || "Say hello" }));
    if (contact.text) card.append(el("p", { text: contact.text }));
    var list = el("ul", { class: "contact-list" });
    if (contact.phone) {
      var phone = el("li");
      var href = telHref(contact.phone);
      phone.append(href ? el("a", { href: href, text: contact.phone }) : el("span", { text: contact.phone }));
      list.append(phone);
    }
    if (contact.email) {
      var mail = el("li");
      var email = safeEmail(contact.email);
      mail.append(email ? el("a", { href: "mailto:" + email, text: contact.email }) : el("span", { text: contact.email }));
      list.append(mail);
    }
    var instagram = safeHttpUrl(contact.instagram);
    if (instagram) {
      var social = el("li");
      social.append(el("a", { href: instagram, text: "Instagram", target: "_blank", rel: "noopener noreferrer" }));
      list.append(social);
    }
    card.append(list);
    var booking = safeHttpUrl(contact.bookingUrl);
    if (booking) {
      card.append(el("a", {
        class: "btn btn-inverse",
        href: booking,
        target: "_blank",
        rel: "noopener noreferrer",
        text: contact.bookingLabel || "Book"
      }));
    }
    if (contact.bookingNote) card.append(el("p", { class: "fine fine-on-dark", text: contact.bookingNote }));
    var wrap = el("div", { class: "wrap" });
    wrap.append(card);
    document.getElementById("contact").append(wrap);
  }

  function renderFooterSite() {
    var footer = document.getElementById("footer");
    var wrap = el("div", { class: "wrap footer-inner" });
    wrap.append(el("p", { class: "footer-name", text: SITE.businessName || "" }));
    if (SITE.location) wrap.append(el("p", { text: SITE.location }));
    if (SITE.footerNote) wrap.append(el("p", { class: "fine", text: SITE.footerNote }));
    footer.append(wrap);
  }

  function updateCartButton() {
    var count = cartCount();
    var button = document.getElementById("open-cart");
    var badge = document.getElementById("cart-count");
    badge.hidden = count <= 0;
    badge.textContent = String(count);
    button.setAttribute("aria-label", count === 0 ? "Open bag" : "Open bag, " + count + (count === 1 ? " item" : " items"));
  }

  function bagLine(line) {
    var product = productById(line.id);
    var row = el("div", { class: "bag-line" });
    row.append(el("img", {
      src: safeImage(product && product.image),
      alt: "",
      width: "64",
      height: "80"
    }));
    var info = el("div");
    info.append(el("p", { class: "bag-name", text: line.name }));
    if (line.size) info.append(el("p", { class: "fine", text: line.size }));
    info.append(el("p", { class: "bag-price", text: Pricing.formatMoney(line.lineCents) }));
    info.append(stepper(line.id, line.qty, line.name));
    info.append(el("button", {
      type: "button",
      class: "text-button",
      "data-action": "remove",
      "data-id": line.id,
      "aria-label": "Remove " + line.name,
      text: "Remove"
    }));
    row.append(info);
    return row;
  }

  function renderCartStep() {
    var order = currentOrder();
    var wrap = el("div");
    if (!order.lines.length) {
      wrap.append(el("p", { class: "empty", text: "Your bag is empty." }));
      wrap.append(el("button", { type: "button", class: "btn btn-secondary", "data-action": "browse", text: "Browse the shelf" }));
      return wrap;
    }
    order.lines.forEach(function (line) {
      wrap.append(bagLine(line));
    });
    return wrap;
  }

  function textField(id, label, draftKey, opts) {
    var options = opts || {};
    var control = el(options.multiline ? "textarea" : "input", {
      id: id,
      name: id,
      "data-draft": draftKey,
      autocomplete: options.autocomplete || null,
      inputmode: options.inputmode || null,
      type: options.multiline ? null : (options.type || "text"),
      placeholder: options.placeholder || null,
      rows: options.multiline ? "3" : null
    });
    if (options.required) control.setAttribute("aria-required", "true");
    control.value = draft[draftKey] || "";
    return el("label", { class: "field", for: id }, [el("span", { text: label }), control]);
  }

  function paintOptions() {
    document.querySelectorAll(".option").forEach(function (label) {
      var input = label.querySelector('input[name="fulfillment"]');
      label.classList.toggle("is-selected", Boolean(input && input.checked));
    });
  }

  function fulfillmentFieldset() {
    var selected = currentFulfillment();
    var set = el("fieldset", { class: "options" });
    set.append(el("legend", { text: "How should Holly get this to you?" }));
    (SITE.fulfillment || []).forEach(function (option) {
      var input = el("input", { type: "radio", name: "fulfillment", value: option.id });
      input.checked = Boolean(selected && selected.id === option.id);
      var copy = el("span", { class: "option-copy" });
      copy.append(el("span", { class: "option-label", text: option.label }));
      if (option.detail) copy.append(el("span", { class: "option-detail", text: option.detail }));
      if (option.zoneNote) copy.append(el("span", { class: "option-detail", text: option.zoneNote }));
      var label = el("label", { class: "option" + (input.checked ? " is-selected" : "") }, [
        input,
        copy,
        el("span", { class: "option-fee", text: Pricing.feeLabel(Pricing.toCents(option.fee)) })
      ]);
      set.append(label);
    });
    return set;
  }

  function addressFieldset() {
    var option = currentFulfillment();
    var set = el("fieldset", { id: "address-fields", class: "address-fields" });
    set.hidden = !(option && option.needsAddress);
    set.append(el("legend", { text: "Where should it go?" }));
    set.append(textField("address-line1", "Street address", "line1", { autocomplete: "address-line1" }));
    set.append(textField("address-line2", "Apt, suite (optional)", "line2", { autocomplete: "address-line2" }));
    set.append(textField("address-city", "City", "city", { autocomplete: "address-level2" }));
    var row = el("div", { class: "addr-row" });
    row.append(textField("address-state", "State", "state", { autocomplete: "address-level1", placeholder: "MN" }));
    row.append(textField("address-postal", "ZIP", "postal", { autocomplete: "postal-code", inputmode: "numeric" }));
    set.append(row);
    return set;
  }

  function renderCheckoutStep() {
    var order = currentOrder();
    var form = el("form", { id: "checkout-form", novalidate: "true", autocomplete: "on" });
    form.append(el("div", { id: "form-errors", class: "form-errors", role: "alert", tabindex: "-1", hidden: true }));
    form.append(el("h3", { class: "form-heading", text: "Your items" }));
    var list = el("ul", { class: "checkout-lines" });
    order.lines.forEach(function (line) {
      var size = line.size ? " (" + line.size + ")" : "";
      list.append(el("li", {}, [
        el("span", { text: line.qty + " \u00d7 " + line.name + size }),
        el("span", { text: Pricing.formatMoney(line.lineCents) })
      ]));
    });
    form.append(list);
    form.append(el("button", { type: "button", class: "text-button", "data-action": "back-cart", text: "Edit bag" }));
    form.append(fulfillmentFieldset());
    form.append(el("h3", { class: "form-heading", text: "Who is this for?" }));
    form.append(textField("customer-name", "Name", "name", { autocomplete: "name", required: true }));
    form.append(textField("customer-phone", "Phone", "phone", { autocomplete: "tel", inputmode: "tel", type: "tel" }));
    form.append(textField("customer-email", "Email", "email", { autocomplete: "email", inputmode: "email", type: "email" }));
    form.append(el("p", { class: "fine", text: "Add a phone number, an email, or both." }));
    form.append(addressFieldset());
    form.append(textField("customer-note", "Note for Holly", "note", {
      multiline: true,
      placeholder: "Optional. For example, leave it at my Thursday appointment."
    }));
    return form;
  }

  function renderDoneStep() {
    var wrap = el("div", { class: "confirm" });
    if (!lastOrder) {
      wrap.append(el("p", { text: "No order request is open." }));
      return wrap;
    }
    var order = lastOrder;
    var pay = SITE.payment || {};
    wrap.append(el("p", { class: "eyebrow", text: "Nothing was charged" }));
    wrap.append(el("p", { class: "order-number", text: order.number }));
    wrap.append(el("p", { id: "form-status", class: "fine", text: "Saving this request in this browser." }));
    if (pay.payAtPickup !== false) {
      wrap.append(el("div", { class: "pay-card" }, [
        el("h3", { text: pay.payAtPickupTitle || "Pay at pickup" }),
        el("p", { text: pay.payAtPickupText || "Pay Holly in person. This page does not charge a card." })
      ]));
    }
    var list = el("ul", { class: "checkout-lines" });
    order.lines.forEach(function (line) {
      var size = line.size ? " (" + line.size + ")" : "";
      list.append(el("li", {}, [
        el("span", { text: line.qty + " \u00d7 " + line.name + size }),
        el("span", { text: Pricing.formatMoney(line.lineCents) })
      ]));
    });
    wrap.append(list);
    var totals = el("dl", { class: "totals" });
    totals.append(totalRow("Subtotal", Pricing.formatMoney(order.subtotalCents)));
    totals.append(totalRow(order.fulfillment ? order.fulfillment.label : "Fulfillment", Pricing.feeLabel(order.feeCents)));
    var grand = totalRow("Total", Pricing.formatMoney(order.totalCents), true);
    grand.querySelector("dd").setAttribute("data-total-cents", String(order.totalCents));
    totals.append(grand);
    wrap.append(totals);
    var actions = el("div", { class: "confirm-actions" });
    actions.append(el("button", { type: "button", class: "btn btn-secondary", "data-action": "copy-order", text: "Copy order details" }));
    var inbox = orderInbox();
    if (inbox) {
      actions.append(el("a", {
        class: "btn btn-secondary",
        href: "mailto:" + inbox + "?subject=" + encodeURIComponent("Order " + order.number) + "&body=" + encodeURIComponent(order.text),
        text: "Email this order to Holly"
      }));
    }
    var payHref = order.payment && safeHttpUrl(order.payment.href);
    if (payHref) {
      actions.append(el("a", {
        class: "btn",
        href: payHref,
        target: "_blank",
        rel: "noopener noreferrer",
        text: pay.paymentLinkLabel || "Pay now"
      }));
      if (pay.paymentLinkNote) actions.append(el("p", { class: "fine", text: pay.paymentLinkNote }));
    }
    wrap.append(actions);
    wrap.append(el("textarea", { id: "copy-fallback", class: "copy-fallback", readonly: "true", hidden: true }));
    return wrap;
  }

  function totalRow(label, value, grand) {
    var row = el("div", { class: grand ? "totals-grand" : null });
    row.append(el("dt", { text: label }));
    var amount = el("dd", { text: value });
  if (grand) amount.id = "order-total";
  row.append(amount);
    return row;
  }

  function renderFooter() {
    var footer = document.getElementById("cart-footer");
    footer.replaceChildren();
    if (step === "done") {
      footer.append(el("button", { type: "button", class: "btn", "data-action": "done", text: "Back to the shelf" }));
      return;
    }
    var order = currentOrder();
    var totals = el("dl", { class: "totals" });
    totals.append(totalRow("Subtotal", Pricing.formatMoney(order.subtotalCents)));
    if (step === "checkout") {
      totals.append(totalRow(order.fulfillment ? order.fulfillment.label : "Fulfillment", Pricing.feeLabel(order.feeCents)));
      var grand = totalRow("Total", Pricing.formatMoney(order.totalCents), true);
      grand.querySelector("dd").setAttribute("data-total-cents", String(order.totalCents));
      totals.append(grand);
    }
    footer.append(totals);
    if (step === "cart") {
      footer.append(el("p", { class: "fine", text: "Pickup is free. Local delivery and shipping are added at checkout." }));
      var checkout = el("button", { type: "button", class: "btn", "data-action": "go-checkout", text: "Checkout" });
      checkout.disabled = order.lines.length === 0;
      footer.append(checkout);
    } else {
      if (SITE.taxNote) footer.append(el("p", { class: "fine", id: "tax-note", text: SITE.taxNote }));
      var place = el("button", { type: "submit", class: "btn", form: "checkout-form", text: "Place order request" });
      place.disabled = order.lines.length === 0;
      footer.append(place);
    }
  }

  function renderDialog() {
    readDraftFromDom();
    var title = document.getElementById("cart-title");
    title.textContent = step === "checkout" ? "Checkout" : step === "done" ? "Request received" : "Your bag";
    var body = document.getElementById("cart-body");
    body.replaceChildren();
    if (step === "cart") body.append(renderCartStep());
    else if (step === "checkout") body.append(renderCheckoutStep());
    else body.append(renderDoneStep());
    renderFooter();
    if (step === "checkout") paintOptions();
  }

  function openCart() {
    document.body.classList.add("modal-open");
    if (!dialog.open) dialog.showModal();
    renderDialog();
  }

  function closeCart() {
    if (dialog.open) dialog.close();
  }

  function goCheckout() {
    if (cartCount() === 0) return;
    if (!draft.fulfillmentId) draft.fulfillmentId = defaultFulfillmentId();
    step = "checkout";
    renderDialog();
    var name = document.getElementById("customer-name");
    if (name) name.focus();
  }

  function restoreFocus(action, id) {
    var selector;
    try {
      selector = '[data-action="' + action + '"][data-id="' + CSS.escape(id) + '"]';
    } catch (err) {
      return;
    }
    var scope = dialog.open ? dialog : document;
    var target = scope.querySelector(selector);
    if (target) target.focus();
  }

  function setQty(id, qty, focusAction) {
    var product = productById(id);
    if (!product) return;
    var prev = cart[id] || 0;
    var next = Pricing.normalizeQty(qty, maxPerProduct());
    if (next <= 0) delete cart[id];
    else cart[id] = next;
    saveCart();
    renderProducts();
    updateCartButton();
    if (dialog.open && (step === "cart" || step === "checkout")) {
      if (step === "checkout" && cartCount() === 0) step = "cart";
      renderDialog();
    }
    if (next > 0 && (focusAction === "add" || focusAction === "inc" || focusAction === "dec")) {
      restoreFocus(focusAction === "add" ? "inc" : focusAction, id);
    } else if (next <= 0 && prev > 0) {
      try {
        var add = document.querySelector('#product-grid [data-action="add"][data-id="' + CSS.escape(id) + '"]');
        if (add) add.focus();
      } catch (err) {
        /* Focus restore is a convenience. */
      }
    }
    if (next === prev) return;
    if (next <= 0) announce(product.name + " removed from the bag.");
    else announce(product.name + ", quantity " + next + ".");
  }

  function mark(id, invalid) {
    var node = document.getElementById(id);
    if (node) node.setAttribute("aria-invalid", invalid ? "true" : "false");
  }

  function submitOrder() {
    readDraftFromDom();
    var customer = customerFromDraft();
    var option = currentFulfillment();
    var errors = [];
    ["customer-name", "customer-phone", "customer-email", "address-line1", "address-city", "address-state", "address-postal"].forEach(function (id) {
      mark(id, false);
    });
    if (!customer.name) {
      errors.push("Add the name for the order.");
      mark("customer-name", true);
    }
    var phoneDigits = (customer.phone.match(/\d/g) || []).length;
    if (!customer.phone && !customer.email) {
      errors.push("Add a phone number or an email.");
      mark("customer-phone", true);
      mark("customer-email", true);
    } else {
      if (customer.phone && phoneDigits < 7) {
        errors.push("That phone number looks too short.");
        mark("customer-phone", true);
      }
      if (customer.email && !safeEmail(customer.email)) {
        errors.push("That email looks off.");
        mark("customer-email", true);
      }
    }
    if (option && option.needsAddress) {
      if (!customer.address.line1) {
        errors.push("Add a street address.");
        mark("address-line1", true);
      }
      if (!customer.address.city) {
        errors.push("Add a city.");
        mark("address-city", true);
      }
      if (!customer.address.state) {
        errors.push("Add a state.");
        mark("address-state", true);
      }
      if (!customer.address.postal) {
        errors.push("Add a ZIP code.");
        mark("address-postal", true);
      }
    }
    var box = document.getElementById("form-errors");
    if (errors.length) {
      box.hidden = false;
      var list = el("ul");
      errors.forEach(function (message) {
        list.append(el("li", { text: message }));
      });
      box.replaceChildren(list);
      box.focus();
      return;
    }
    if (box) box.hidden = true;
    placeOrder(customer);
  }

  function orderPayload(order) {
    return {
      orderNumber: order.number,
      businessName: SITE.businessName,
      createdAt: order.createdAt,
      customer: {
        name: order.customer.name,
        phone: order.customer.phone,
        email: order.customer.email,
        note: order.customer.note
      },
      fulfillment: order.fulfillment ? {
        id: order.fulfillment.id,
        label: order.fulfillment.label,
        fee: Pricing.dollarsString(order.feeCents)
      } : null,
      address: order.fulfillment && order.fulfillment.needsAddress ? order.customer.address : null,
      items: order.lines.map(function (line) {
        return {
          id: line.id,
          name: line.name,
          size: line.size,
          qty: line.qty,
          unitPrice: Pricing.dollarsString(line.unitCents),
          lineTotal: Pricing.dollarsString(line.lineCents)
        };
      }),
      subtotal: Pricing.dollarsString(order.subtotalCents),
      fee: Pricing.dollarsString(order.feeCents),
      total: Pricing.dollarsString(order.totalCents),
      taxNote: SITE.taxNote || ""
    };
  }

  function notifyForm(order) {
    var url = safeHttpUrl(SITE.contact && SITE.contact.formEndpoint);
    var status = document.getElementById("form-status");
    if (!url) {
      if (status) status.textContent = "This request is saved in this browser. Send it to Holly with copy or email. Nothing is transmitted until you do.";
      return;
    }
    if (status) status.textContent = "Sending the request…";
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(orderPayload(order))
    }).then(function (res) {
      var node = document.getElementById("form-status");
      if (!node) return;
      node.textContent = res.ok
        ? "Sent to Holly's form inbox."
        : "Could not reach the form inbox. Copy the order or email it instead.";
    }).catch(function () {
      var node = document.getElementById("form-status");
      if (node) node.textContent = "Could not reach the form inbox. Copy the order or email it instead.";
    });
  }

  function makeOrderNumber() {
    var tail = String(Date.now()).slice(-4);
    var rand = String(Math.floor(Math.random() * 90) + 10);
    return "HH-" + rand + tail;
  }

  function placeOrder(customer) {
    var built = currentOrder();
    if (!built.lines.length) {
      step = "cart";
      renderDialog();
      return;
    }
    var order = {
      number: makeOrderNumber(),
      createdAt: new Date().toISOString(),
      lines: built.lines,
      fulfillment: built.fulfillment,
      subtotalCents: built.subtotalCents,
      feeCents: built.feeCents,
      totalCents: built.totalCents,
      customer: customer
    };
    order.text = Pricing.formatOrderText(order, customer, {
      businessName: SITE.businessName,
      taxNote: SITE.taxNote || ""
    });
    order.payment = Pricing.resolvePaymentLink(order.lines, visibleProducts(), SITE.payment || {});
    lastOrder = order;
    saveOrder(order);
    cart = {};
    saveCart();
    draft = {
      name: "",
      phone: "",
      email: "",
      note: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postal: "",
      fulfillmentId: defaultFulfillmentId()
    };
    step = "done";
    renderProducts();
    updateCartButton();
    renderDialog();
    notifyForm(order);
    announce("Order request " + order.number + " received. Total " + Pricing.formatMoney(order.totalCents) + ".");
  }

  function copyOrder() {
    if (!lastOrder) return;
    var button = document.querySelector("[data-action='copy-order']");
    var markCopied = function (label) {
      if (button) button.textContent = label;
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastOrder.text).then(function () {
        markCopied("Copied");
        announce("Order details copied.");
      }).catch(showCopyFallback);
    } else {
      showCopyFallback();
    }
  }

  function showCopyFallback() {
    var box = document.getElementById("copy-fallback");
    if (!box || !lastOrder) return;
    box.hidden = false;
    box.value = lastOrder.text;
    box.focus();
    box.select();
    var button = document.querySelector("[data-action='copy-order']");
    if (button) button.textContent = "Select the order text, then copy";
  }

  function onFulfillmentChange() {
    var checked = document.querySelector('input[name="fulfillment"]:checked');
    if (checked) draft.fulfillmentId = checked.value;
    var option = currentFulfillment();
    var address = document.getElementById("address-fields");
    if (address) address.hidden = !(option && option.needsAddress);
    paintOptions();
    renderFooter();
  }

  function onClick(event) {
    var node = event.target.closest("[data-action]");
    if (!node) return;
    var action = node.dataset.action;
    var id = node.dataset.id;
    if (action === "open-cart") openCart();
    else if (action === "close-cart") closeCart();
    else if (action === "go-checkout") goCheckout();
    else if (action === "back-cart") {
      step = "cart";
      renderDialog();
    } else if (action === "add" || action === "inc") setQty(id, (cart[id] || 0) + 1, action);
    else if (action === "dec") setQty(id, (cart[id] || 0) - 1, action);
    else if (action === "remove") setQty(id, 0, action);
    else if (action === "copy-order") copyOrder();
    else if (action === "browse" || action === "done") {
      closeCart();
      if (action === "browse") {
        var shop = document.getElementById("shop");
        if (shop) shop.scrollIntoView();
      }
    }
  }

  function onChange(event) {
    var target = event.target;
    if (!target) return;
    if (target.dataset && target.dataset.qty) {
      setQty(target.dataset.qty, target.value);
      return;
    }
    if (target.name === "fulfillment") onFulfillmentChange();
  }

  function onInput(event) {
    var target = event.target;
    if (target && target.dataset && target.dataset.draft) draft[target.dataset.draft] = target.value;
  }

  function onSubmit(event) {
    if (!event.target || event.target.id !== "checkout-form") return;
    event.preventDefault();
    submitOrder();
  }

  function bind() {
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
    document.addEventListener("input", onInput);
    document.addEventListener("submit", onSubmit);
    dialog.addEventListener("close", function () {
      document.body.classList.remove("modal-open");
      if (step === "done") {
        step = "cart";
        lastOrder = null;
      }
    });
    dialog.addEventListener("click", function (event) {
      if (!dialog.open) return;
      var rect = dialog.getBoundingClientRect();
      var inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!inside) dialog.close();
    });
  }

  function init() {
    var problems = Pricing.validateSite(SITE);
    if (problems.length) {
      var boot = document.getElementById("boot-error");
      boot.hidden = false;
      boot.textContent = problems.join(" ");
    }
    draft.fulfillmentId = defaultFulfillmentId();
    loadCart();
    renderAnnouncement();
    renderNav();
    renderHero();
    document.getElementById("shop-heading").textContent = (SITE.shop && SITE.shop.heading) || "Shop";
    document.getElementById("shop-intro").textContent = (SITE.shop && SITE.shop.intro) || "";
    renderProducts();
    renderAbout();
    renderHow();
    renderFaq();
    renderContact();
    renderFooterSite();
    updateCartButton();
    bind();
  }

  try {
    init();
    document.body.classList.add("is-ready");
  } catch (err) {
    var boot = document.getElementById("boot-error");
    boot.hidden = false;
    boot.textContent = "The shop hit an error (" + (err && err.message ? err.message : "unknown") + "). If you just edited site.js, check for a missing comma or quote.";
    document.body.classList.add("is-ready");
  }
})();
