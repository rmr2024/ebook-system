const USD_TO_INR = 92.87;

const BOOKS = [
  {
    id: "pride-and-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    price: convertUsdToInr(11.0),
    priceLabel: "Paperback",
    genre: "Classic Romance",
    summary: "Elizabeth Bennet and Mr. Darcy circle each other through wit, pride, and one of literature's best-known love stories.",
    cover: "https://covers.openlibrary.org/b/isbn/9781847493699-L.jpg",
    source: "https://www.barnesandnoble.com/w/pride-and-prejudice-jane-austen/1146875464"
  },
  {
    id: "emma",
    title: "Emma",
    author: "Jane Austen",
    price: convertUsdToInr(12.0),
    priceLabel: "Paperback",
    genre: "Classic Comedy",
    summary: "A clever young woman learns hard lessons about matchmaking, friendship, and knowing her own heart.",
    cover: "https://covers.openlibrary.org/b/isbn/9781847494139-L.jpg",
    source: "https://www.barnesandnoble.com/w/emma-jane-austen/1146511393"
  },
  {
    id: "sense-and-sensibility",
    title: "Sense and Sensibility",
    author: "Jane Austen",
    price: convertUsdToInr(8.0),
    priceLabel: "Paperback",
    genre: "Classic Romance",
    summary: "Two sisters navigate love, heartbreak, and family pressures with very different temperaments.",
    cover: "https://covers.openlibrary.org/b/isbn/9780141439662-L.jpg",
    source: "https://www.barnesandnoble.com/w/_/_?ean=9780141439662"
  },
  {
    id: "little-women",
    title: "Little Women",
    author: "Louisa May Alcott",
    price: convertUsdToInr(10.99),
    priceLabel: "Paperback",
    genre: "Family Classic",
    summary: "The March sisters grow up with warmth, ambition, and strong family bonds during the Civil War era.",
    cover: "https://books.google.com/books/content?vid=ISBN9781435171701&printsec=frontcover&img=1&zoom=1&source=gbs_api",
    source: "https://www.barnesandnoble.com/w/little-women-louisa-may-alcott/1116668150"
  },
  {
    id: "anne-of-green-gables",
    title: "Anne of Green Gables",
    author: "L. M. Montgomery",
    price: convertUsdToInr(9.99),
    priceLabel: "Paperback",
    genre: "Children's Classic",
    summary: "Anne Shirley brings imagination, charm, and plenty of heart to life at Green Gables.",
    cover: "https://covers.openlibrary.org/b/isbn/9780141321592-L.jpg",
    source: "https://www.barnesandnoble.com/w/?ean=9780141321592"
  },
  {
    id: "a-little-princess",
    title: "A Little Princess",
    author: "Frances Hodgson Burnett",
    price: convertUsdToInr(9.99),
    priceLabel: "Paperback",
    genre: "Children's Classic",
    summary: "Sara Crewe faces hardship with kindness, imagination, and quiet strength in this gentle classic.",
    cover: "https://covers.openlibrary.org/b/isbn/9781454953579-L.jpg",
    source: "https://www.barnesandnoble.com/w/a-little-princess-frances-hodgson-burnett/1001894762?bvstate=pg%3A2%2Fct%3Ar"
  }
];

const USERS_KEY = "midnightShelfUsers";
const SESSION_KEY = "midnightShelfSession";
const CART_KEY = "midnightShelfCart";
const FLASH_KEY = "midnightShelfFlash";
const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function convertUsdToInr(amount) {
  return Math.round(amount * USD_TO_INR);
}

document.addEventListener("DOMContentLoaded", init);

function init() {
  const page = getCurrentPage();

  bindAuthForms();
  bindLogoutButtons();
  bindCheckoutButton();

  if ((page === "catalog.html" || page === "cart.html") && !requireAuth()) {
    return;
  }

  updateCartCount();

  if (page === "login.html") {
    showLoginFlash();
  }

  if (page === "catalog.html") {
    renderCatalog();
  }

  if (page === "cart.html") {
    renderCart();
  }
}

function getCurrentPage() {
  const page = window.location.pathname.split("/").pop();
  return page ? page.toLowerCase() : "login.html";
}

function bindAuthForms() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
}

function bindLogoutButtons() {
  document.querySelectorAll("[data-logout]").forEach((button) => {
    button.addEventListener("click", logout);
  });
}

function bindCheckoutButton() {
  const checkoutButton = document.getElementById("checkout-button");

  if (checkoutButton) {
    checkoutButton.addEventListener("click", handleCheckout);
  }
}

function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("loginUser")?.value.trim();
  const password = document.getElementById("loginPass")?.value.trim();
  const users = getUsers();

  if (!username || !password) {
    setMessage("login-message", "Enter both username and password to continue.", "error");
    return;
  }

  const matchingUser = users.find(
    (user) =>
      user.username.toLowerCase() === username.toLowerCase() &&
      user.password === password
  );

  if (users.length > 0 && !matchingUser) {
    setMessage("login-message", "Those credentials do not match a saved account.", "error");
    return;
  }

  const session = {
    username: matchingUser ? matchingUser.username : username
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setMessage("login-message", "Login successful. Opening the catalog...", "success");

  window.setTimeout(() => {
    window.location.href = "catalog.html";
  }, 350);
}

function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById("regUser")?.value.trim();
  const password = document.getElementById("regPass")?.value.trim();
  const users = getUsers();

  if (!username || !password) {
    setMessage("register-message", "Enter a username and password to create your account.", "error");
    return;
  }

  if (password.length < 4) {
    setMessage("register-message", "Use at least 4 characters for the password.", "error");
    return;
  }

  const duplicate = users.some(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  );

  if (duplicate) {
    setMessage("register-message", "That username already exists. Choose another one.", "error");
    return;
  }

  users.push({ username, password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(
    FLASH_KEY,
    JSON.stringify({
      text: "Account created. Please log in to open the catalog.",
      tone: "success"
    })
  );

  window.location.href = "login.html";
}

function showLoginFlash() {
  const raw = localStorage.getItem(FLASH_KEY);

  if (!raw) {
    return;
  }

  try {
    const flash = JSON.parse(raw);
    setMessage("login-message", flash.text, flash.tone);
  } catch (error) {
    localStorage.removeItem(FLASH_KEY);
    return;
  }

  localStorage.removeItem(FLASH_KEY);
}

function requireAuth() {
  const session = getSession();

  if (session) {
    return true;
  }

  localStorage.setItem(
    FLASH_KEY,
    JSON.stringify({
      text: "Please log in to view your books and cart.",
      tone: "error"
    })
  );
  window.location.replace("login.html");
  return false;
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CART_KEY);
  localStorage.setItem(
    FLASH_KEY,
    JSON.stringify({
      text: "You have been logged out.",
      tone: "success"
    })
  );
  window.location.href = "login.html";
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (error) {
    return null;
  }
}

function getUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    return Array.isArray(users) ? users : [];
  } catch (error) {
    return [];
  }
}

function renderCatalog() {
  const bookList = document.getElementById("book-list");

  if (!bookList) {
    return;
  }

  bookList.innerHTML = BOOKS.map((book) => createBookCard(book)).join("");
  bookList.addEventListener("click", handleCatalogActions);
}

function createBookCard(book) {
  return `
    <article class="book-card surface">
      <div class="book-cover">
        <img src="${book.cover}" alt="${book.title} book cover">
      </div>
      <div class="book-meta">
        <span class="genre-pill">${book.genre}</span>
        <h3>${book.title}</h3>
        <p class="book-author">by ${book.author}</p>
        <p class="book-summary">${book.summary}</p>
        <div class="price-row">
          <div>
            <span class="price-label">${book.priceLabel}</span>
            <strong>${money.format(book.price)}</strong>
          </div>
          <button type="button" class="primary-button" data-add-to-cart="${book.id}">Add to Cart</button>
        </div>
        <a class="source-link" href="${book.source}" target="_blank" rel="noreferrer">View source</a>
      </div>
    </article>
  `;
}

function handleCatalogActions(event) {
  const button = event.target.closest("[data-add-to-cart]");

  if (!button) {
    return;
  }

  addToCart(button.getAttribute("data-add-to-cart"));
  button.textContent = "Added";
  window.setTimeout(() => {
    button.textContent = "Add to Cart";
  }, 900);
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const checkoutButton = document.getElementById("checkout-button");
  const summary = document.getElementById("cart-summary-count");
  const total = document.getElementById("cart-total");
  const items = getCartItems();

  if (!cartItems || !checkoutButton || !summary || !total) {
    return;
  }

  if (items.length === 0) {
    cartItems.innerHTML = `
      <article class="empty-state surface">
        <p class="eyebrow">No Books Yet</p>
        <h3>Your cart is empty.</h3>
        <p>Add books from the catalog to see them listed here and continue to payment.</p>
        <a href="catalog.html" class="secondary-button">Browse Catalog</a>
      </article>
    `;
  } else {
    cartItems.innerHTML = items.map((item) => createCartItem(item)).join("");
  }

  summary.textContent = `${getCartCount()} item${getCartCount() === 1 ? "" : "s"} selected`;
  total.textContent = money.format(getCartTotal());
  checkoutButton.disabled = items.length === 0;

  if (!cartItems.dataset.bound) {
    cartItems.addEventListener("click", handleCartActions);
    cartItems.dataset.bound = "true";
  }
}

function createCartItem(item) {
  return `
    <article class="cart-item surface">
      <img class="cart-thumb" src="${item.cover}" alt="${item.title} cover">
      <div class="cart-copy">
        <p class="eyebrow">${item.genre}</p>
        <h3>${item.title}</h3>
        <p class="book-author">by ${item.author}</p>
        <p class="book-summary">${item.summary}</p>
      </div>
      <div class="cart-controls">
        <strong>${money.format(item.lineTotal)}</strong>
        <div class="quantity-controls" aria-label="Quantity controls">
          <button type="button" class="quantity-button" data-quantity="decrease" data-book-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button type="button" class="quantity-button" data-quantity="increase" data-book-id="${item.id}">+</button>
        </div>
        <button type="button" class="link-button" data-remove-book="${item.id}">Remove</button>
      </div>
    </article>
  `;
}

function handleCartActions(event) {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove-book]");

  if (quantityButton) {
    const bookId = quantityButton.getAttribute("data-book-id");
    const amount = quantityButton.getAttribute("data-quantity") === "increase" ? 1 : -1;
    changeCartQuantity(bookId, amount);
    setMessage("cart-message", "", "");
    renderCart();
    updateCartCount();
    return;
  }

  if (removeButton) {
    removeFromCart(removeButton.getAttribute("data-remove-book"));
    setMessage("cart-message", "", "");
    renderCart();
    updateCartCount();
  }
}

function handleCheckout() {
  const total = getCartTotal();

  if (!getCart().length) {
    setMessage("cart-message", "Add at least one book before proceeding to pay.", "error");
    return;
  }

  const shouldCheckout = window.confirm(
    `Proceed to pay ${money.format(total)} for your selected books?`
  );

  if (!shouldCheckout) {
    return;
  }

  localStorage.removeItem(CART_KEY);
  renderCart();
  updateCartCount();
  setMessage("cart-message", `Payment flow placeholder ready for ${money.format(total)}. Cart cleared.`, "success");
}

function addToCart(bookId) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === bookId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: bookId, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
}

function changeCartQuantity(bookId, amount) {
  const cart = getCart();
  const item = cart.find((entry) => entry.id === bookId);

  if (!item) {
    return;
  }

  item.quantity += amount;

  if (item.quantity <= 0) {
    saveCart(cart.filter((entry) => entry.id !== bookId));
    return;
  }

  saveCart(cart);
}

function removeFromCart(bookId) {
  saveCart(getCart().filter((item) => item.id !== bookId));
}

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY));
    const validBookIds = new Set(BOOKS.map((book) => book.id));

    if (!Array.isArray(cart)) {
      return [];
    }

    return cart.filter(
      (item) =>
        item &&
        validBookIds.has(item.id) &&
        typeof item.id === "string" &&
        typeof item.quantity === "number" &&
        item.quantity > 0
    );
  } catch (error) {
    return [];
  }
}

function getCartItems() {
  return getCart()
    .map((item) => {
      const book = BOOKS.find((entry) => entry.id === item.id);
      return book
        ? {
            ...book,
            quantity: item.quantity,
            lineTotal: item.quantity * book.price
          }
        : null;
    })
    .filter(Boolean);
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartCount() {
  return getCart().reduce((count, item) => count + item.quantity, 0);
}

function getCartTotal() {
  return getCartItems().reduce((sum, item) => sum + item.lineTotal, 0);
}

function updateCartCount() {
  const count = getCartCount();
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = String(count);
  });
}

function setMessage(elementId, text, tone) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.textContent = text;
  element.className = "form-message";

  if (tone) {
    element.classList.add(`is-${tone}`);
  }
}
