let products = [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];

const productsEl = document.getElementById("products");
const searchInput = document.getElementById("searchInput");
const brandFilter = document.getElementById("brandFilter");
const sortSelect = document.getElementById("sortSelect");
const cartCount = document.getElementById("cartCount");

const cartModal = document.getElementById("cartModal");
const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const buyBtn = document.getElementById("buyBtn"); // ⬅️ BOTÓN COMPRAR

/* -------- CARGAR PRODUCTOS -------- */
async function loadProducts() {
  const res = await fetch("products.json");
  products = await res.json();
  loadBrands();
  renderProducts();
  updateCartCount();
}

/* -------- MARCAS -------- */
function loadBrands() {
  const brands = [...new Set(products.map(p => p.brand))];
  brands.forEach(b => {
    let op = document.createElement("option");
    op.value = op.textContent = b;
    brandFilter.appendChild(op);
  });
}

/* -------- MOSTRAR PRODUCTOS -------- */
function renderProducts() {
  productsEl.innerHTML = "";

  let list = products.filter(p =>
    p.title.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  if (brandFilter.value)
    list = list.filter(p => p.brand === brandFilter.value);

  if (sortSelect.value === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "rating-desc") list.sort((a, b) => b.rating - a.rating);

  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "productCard";

    card.innerHTML = `
      <img src="${p.image}">
      <h3>${p.title}</h3>
      <p class="brand">${p.brand}</p>
      <p class="price">$${p.price}</p>
      <button class="btn-add" data-id="${p.id}">Agregar al carrito</button>
    `;

    productsEl.appendChild(card);
  });
}

/* -------- AÑADIR AL CARRITO -------- */
document.addEventListener("click", e => {
  if (e.target.classList.contains("btn-add")) {
    addToCart(Number(e.target.dataset.id));
  }

  if (e.target.classList.contains("btnPlus")) {
    changeQty(Number(e.target.dataset.id), 1);
  }

  if (e.target.classList.contains("btnMinus")) {
    changeQty(Number(e.target.dataset.id), -1);
  }
});

function addToCart(id) {
  let item = cart.find(x => x.id === id);
  if (item) item.qty++;
  else cart.push({ id, qty: 1 });

  saveCart();
}

/* -------- MOSTRAR CARRITO -------- */
function showCart() {
  cartItemsEl.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    let p = products.find(x => x.id === item.id);
    if (!p) return;

    total += p.price * item.qty;

    let div = document.createElement("div");
    div.className = "cartItem";

    div.innerHTML = `
      <span>${p.title} - $${p.price}</span>

      <div class="qtyButtons">
        <button class="btnMinus" data-id="${p.id}">-</button>
        ${item.qty}
        <button class="btnPlus" data-id="${p.id}">+</button>
      </div>
    `;

    cartItemsEl.appendChild(div);
  });

  cartTotalEl.textContent = total;
  cartModal.style.display = "flex";
}

/* -------- CAMBIAR CANTIDAD -------- */
function changeQty(id, amount) {
  let item = cart.find(x => x.id === id);
  if (!item) return;

  item.qty += amount;
  if (item.qty <= 0) {
    cart = cart.filter(x => x.id !== id);
  }

  saveCart();
  showCart();
}

/* -------- GUARDAR -------- */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

/* -------- CONTADOR -------- */
function updateCartCount() {
  let totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = totalQty;
}

/* -------- CHECKOUT (COMPRAR) -------- */
function checkout() {
  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  alert("¡Compra realizada con éxito! 🎉");

  cart = [];
  saveCart();
  showCart();
}

/* -------- EVENTOS -------- */
searchInput.addEventListener("input", renderProducts);
brandFilter.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);

openCart.addEventListener("click", showCart);
closeCart.addEventListener("click", () => cartModal.style.display = "none");

buyBtn.addEventListener("click", checkout); // ⬅️ BOTÓN LISTO

loadProducts();
