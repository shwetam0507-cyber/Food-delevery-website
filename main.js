document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".mySwiper")) {
    new Swiper(".mySwiper", {
      loop: true,
      navigation: {
        nextEl: "#next",
        prevEl: "#prev",
      },
    });
  }

  const cartIcon = document.querySelector(".cart-icon");
  const cartTab = document.querySelector(".cart-tab");
  const closeBtn = document.querySelector(".close-btn");
  const cardList = document.querySelector(".card-list");
  const cartList = document.querySelector(".cart-list");
  const cartTotal = document.querySelector(".cart-total");
  const cartValue = document.querySelector(".cart-value");
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", (e) => {
      e.preventDefault();
      mobileMenu.classList.toggle("mobile-menu-active");
    });
    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("mobile-menu-active");
      });
    });
  }

  if (!cartList || !cardList) {
    console.error("cart-list ya card-list HTML mein nahi mila");
    return;
  }

  let productList = [];
  let cartProduct = [];

  const parsePrice = (value) =>
    Number(String(value).replace(/[^0-9.]/g, "")) || 0;

  const updateTotals = () => {
    let total = 0;
    cartList.querySelectorAll(".item").forEach((item) => {
      const price = parseFloat(item.dataset.unitPrice);
      const qty = parseInt(item.dataset.quantity, 10);
      total += price * qty;
    });
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;
    if (cartValue) cartValue.textContent = String(cartProduct.length);
  };

  const updateItemDisplay = (item) => {
    const price = parseFloat(item.dataset.unitPrice);
    const qty = parseInt(item.dataset.quantity, 10);
    item.querySelector(".quantity-value").textContent = qty;
    item.querySelector(".item-total").textContent = `$${(price * qty).toFixed(2)}`;
  };

  if (cartIcon && cartTab) {
    cartIcon.addEventListener("click", (e) => {
      e.preventDefault();
      cartTab.classList.add("cart-tab-active");
    });
  }

  if (closeBtn && cartTab) {
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      cartTab.classList.remove("cart-tab-active");
    });
  }

  cartList.addEventListener("click", (e) => {
    const plus = e.target.closest(".plus");
    const minus = e.target.closest(".minus");
    if (!plus && !minus) return;

    e.preventDefault();
    e.stopPropagation();

    const item = e.target.closest(".item");
    if (!item) return;

    const id = Number(item.dataset.productId);
    let qty = parseInt(item.dataset.quantity, 10);

    if (plus) {
      qty += 1;
      item.dataset.quantity = String(qty);
      updateItemDisplay(item);
      updateTotals();
      return;
    }

    if (qty > 1) {
      qty -= 1;
      item.dataset.quantity = String(qty);
      updateItemDisplay(item);
      updateTotals();
      return;
    }

    item.classList.add("slide-out");
    setTimeout(() => {
      item.remove();
      cartProduct = cartProduct.filter((p) => p.id !== id);
      updateTotals();
    }, 300);
  });

  const addToCart = (product) => {
    const existing = cartList.querySelector(
      `.item[data-product-id="${product.id}"]`
    );

    if (existing) {
      let qty = parseInt(existing.dataset.quantity, 10) + 1;
      existing.dataset.quantity = String(qty);
      updateItemDisplay(existing);
      updateTotals();
      return;
    }

    const price = parsePrice(product.price);
    cartProduct.push(product);

    const item = document.createElement("div");
    item.classList.add("item");
    item.dataset.productId = String(product.id);
    item.dataset.unitPrice = String(price);
    item.dataset.quantity = "1";

    item.innerHTML = `
      <div class="item-image">
        <img src="${product.img}" alt="${product.name}">
      </div>
      <div class="details">
        <h4>${product.name}</h4>
        <h4 class="item-total">$${price.toFixed(2)}</h4>
      </div>
      <div class="flex">
        <a href="#" class="quantity-btn minus"><i class="fa-solid fa-minus"></i></a>
        <h4 class="quantity-value">1</h4>
        <a href="#" class="quantity-btn plus"><i class="fa-solid fa-plus"></i></a>
      </div>
    `;

    cartList.appendChild(item);
    updateTotals();
  };

  const showCards = () => {
    productList.forEach((product) => {
      const card = document.createElement("div");
      card.classList.add("order-card");
      card.innerHTML = `
        <div class="card-image">
          <img src="${product.img}" alt="${product.name}">
        </div>
        <h4>${product.name}</h4>
        <h4 class="price">${product.price}</h4>
        <a href="#" class="btn card-btn">Add to Cart</a>
      `;
      cardList.appendChild(card);
      card.querySelector(".card-btn").addEventListener("click", (e) => {
        e.preventDefault();
        addToCart(product);
      });
    });
  };

  fetch("products.json")
    .then((res) => res.json())
    .then((data) => {
      productList = data;
      showCards();
    })
    .catch((err) => console.error("products.json error:", err));
});
