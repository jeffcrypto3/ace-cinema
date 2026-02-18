// Food & Drinks Page JavaScript

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  setupCategoryTabs();
  setupQuantityControls();
  setupAddToCart();
  setupCartSidebar();
  setupMobileMenu();
  
  // Load and display cart from localStorage
  updateCartDisplay();
  updateCartCount();
  
  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 150) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
});

// Setup category tabs
function setupCategoryTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const foodItems = document.querySelectorAll(".food-item");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all tabs
      tabBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.category;

      // Filter items
      foodItems.forEach((item) => {
        if (category === "all" || item.dataset.category === category) {
          item.classList.remove("hidden");
        } else {
          item.classList.add("hidden");
        }
      });
    });
  });
}

// Setup quantity controls
function setupQuantityControls() {
  document.querySelectorAll(".food-item").forEach((item) => {
    const minusBtn = item.querySelector(".qty-btn.minus");
    const plusBtn = item.querySelector(".qty-btn.plus");
    const quantitySpan = item.querySelector(".quantity");

    minusBtn.addEventListener("click", () => {
      let quantity = parseInt(quantitySpan.textContent);
      if (quantity > 1) {
        quantity--;
        quantitySpan.textContent = quantity;
      }
    });

    plusBtn.addEventListener("click", () => {
      let quantity = parseInt(quantitySpan.textContent);
      quantity++;
      quantitySpan.textContent = quantity;
    });
  });
}

// Setup size selection
function setupSizeSelection(item) {
  const sizeButtons = item.querySelectorAll(".size-btn");
  
  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

// Initialize size buttons for all items
document.querySelectorAll(".food-item").forEach((item) => {
  setupSizeSelection(item);
});

// Setup add to cart
function setupAddToCart() {
  document.querySelectorAll(".add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".food-item");
      const name = btn.dataset.name;
      const quantity = parseInt(item.querySelector(".quantity").textContent);
      
      let price, size;
      
      // Check if it's a combo (has fixed price in button)
      if (btn.dataset.price) {
        price = parseInt(btn.dataset.price);
        size = "Combo";
      } else {
        // Get selected size and price
        const activeSize = item.querySelector(".size-btn.active");
        size = activeSize.dataset.size.charAt(0).toUpperCase() + activeSize.dataset.size.slice(1);
        price = parseInt(activeSize.dataset.price);
      }

      // Add to cart
      addToCart(name, size, price, quantity);

      // Reset quantity to 1
      item.querySelector(".quantity").textContent = "1";

      // Show feedback
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
      btn.style.background = "#4CAF50";
      
      setTimeout(() => {
        btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
        btn.style.background = "#ffcc00";
      }, 1500);
    });
  });
}

// Add to cart function
function addToCart(name, size, price, quantity) {
  CartUtils.addOrUpdateFood(name, size, price, quantity);
  updateCartDisplay();
  updateCartCount();
}

// Update cart display
function updateCartDisplay() {
  const cartItems = document.getElementById("cartItems");
  const cart = CartUtils.loadCart();
  
  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <i class="fa-solid fa-cart-shopping"></i>
        <p>Your cart is empty</p>
      </div>
    `;
    document.getElementById("checkoutBtn").disabled = true;
  } else {
    cartItems.innerHTML = cart
      .map(
        (item, index) => {
          // Check if it's a ticket or food item
          if (item.type === 'ticket') {
            return `
      <div class="cart-item">
        <div class="cart-item-header">
          <span class="cart-item-name">${item.movie}</span>
          <button class="remove-item" onclick="removeFromCart(${index})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="cart-item-details">
          ${item.date}<br>
          ${item.time}<br>
          ${item.tickets.adult > 0 ? item.tickets.adult + " Adult, " : ""}${
          item.tickets.child > 0 ? item.tickets.child + " Child, " : ""
        }${item.tickets.senior > 0 ? item.tickets.senior + " Senior" : ""}<br>
          Seats: ${item.seats}
        </div>
        <div class="cart-item-footer">
          <span class="cart-item-price">₦${item.price.toLocaleString()}</span>
        </div>
      </div>
    `;
          } else {
            // Food item
            return `
      <div class="cart-item">
        <div class="cart-item-header">
          <span class="cart-item-name">${item.name}</span>
          <button class="remove-item" onclick="removeFromCart(${index})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        <div class="cart-item-details">
          ${item.size} × ${item.quantity}
        </div>
        <div class="cart-item-footer">
          <span class="cart-item-price">₦${(item.price * item.quantity).toLocaleString()}</span>
        </div>
      </div>
    `;
          }
        }
      )
      .join("");
    
    document.getElementById("checkoutBtn").disabled = false;
  }

  updateCartTotal();
}

// Remove from cart
function removeFromCart(index) {
  CartUtils.removeItem(index);
  updateCartDisplay();
  updateCartCount();
}

// Update cart count
function updateCartCount() {
  const totalItems = CartUtils.getCount();
  document.getElementById("cartCount").textContent = totalItems;
  document.getElementById("mobileCartCount").textContent = totalItems;
}

// Update cart total
function updateCartTotal() {
  const total = CartUtils.getTotal();
  document.getElementById("cartTotal").textContent = `₦${total.toLocaleString()}`;
}

// Setup cart sidebar
function setupCartSidebar() {
  const cartSidebar = document.getElementById("cartSidebar");
  const displayCart = document.getElementById("displayCart");
  const displayMobileCart = document.getElementById("displayMobileCart");
  const closeCart = document.getElementById("closeCart");
  const checkoutBtn = document.getElementById("checkoutBtn");

  displayCart.addEventListener("click", () => {
    cartSidebar.classList.add("active");
  });

  displayMobileCart.addEventListener("click", () => {
    cartSidebar.classList.add("active");
  });

  closeCart.addEventListener("click", () => {
    cartSidebar.classList.remove("active");
  });

  checkoutBtn.addEventListener("click", () => {
    processCheckout();
  });
}

// Process checkout
function processCheckout() {
  const cart = CartUtils.loadCart();
  if (cart.length === 0) {
    showModal("Your cart is empty! Please add items before checking out.", { type: 'warning', title: 'Empty Cart' });
    return;
  }
  
  // Redirect to checkout page
  window.location.href = "checkout.html";
  
  // Close cart sidebar
  document.getElementById("cartSidebar").classList.remove("active");
  
  // Clear cart
  CartUtils.clearCart();
  updateCartDisplay();
  updateCartCount();
}

// Setup mobile menu
function setupMobileMenu() {
  const cartBtn = document.getElementById("cartBtn");
  const closeBtn = document.getElementById("closeBtn");
  const menuContainer = document.getElementById("menuContainer");

  if (cartBtn) {
    cartBtn.addEventListener("click", () => {
      menuContainer.style.display = "block";
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      menuContainer.style.display = "none";
    });
  }
}
