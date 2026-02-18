// Unified Cart Management with localStorage
// This file handles all cart operations across the cinema website

const CART_STORAGE_KEY = 'acecinema_cart';
const CART_TIMER_KEY = 'acecinema_cart_timer';
const CART_EXPIRY_MINUTES = 3; // 3 minutes for testing
const WARNING_TIME_SECONDS = 30; // Show warning 30 seconds before expiry

// Cart utility object
const CartUtils = {
  // Load cart from localStorage
  loadCart() {
    try {
      const cartData = localStorage.getItem(CART_STORAGE_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      return [];
    }
  },

  // Save cart to localStorage
  saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      return true;
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      return false;
    }
  },

  // Add item to cart
  addItem(item) {
    const cart = this.loadCart();
    cart.push(item);
    this.saveCart(cart);
    this.startTimer(); // Start timer when item is added
    return cart;
  },

  // Remove item from cart by index
  removeItem(index) {
    const cart = this.loadCart();
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      this.saveCart(cart);
    this.resetTimer(); // Reset timer on cart interaction
    }
    return cart;
  },

  // Clear entire cart
  clearCart() {
    localStorage.removeItem(CART_TIMER_KEY);
    this.stopTimer();
    localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  },

  // Get cart total price
  getTotal() {
    const cart = this.loadCart();
    return cart.reduce((sum, item) => {
      if (item.type === 'ticket') {
        // Ticket booking
        return sum + item.price;
      } else {
        // Food item
        return sum + (item.price * item.quantity);
      }
    }, 0);
  },

  // Get cart item count
  getCount() {
    const cart = this.loadCart();
    return cart.reduce((count, item) => {
      if (item.type === 'ticket') {
        // Count each booking as 1 item
        return count + 1;
      } else {
        // Count food item quantities
        return count + item.quantity;
      }
    }, 0);
  },

  // Check if cart has items
  isEmpty() {
    const cart = this.loadCart();
    return cart.length === 0;
  },

  // Get cart items by type
  getItemsByType(type) {
    const cart = this.loadCart();
    return cart.filter(item => item.type === type);
  },

  // Update food item quantity
  updateFoodQuantity(index, newQuantity) {
    const cart = this.loadCart();
    if (index >= 0 && index < cart.length && cart[index].type !== 'ticket') {
      if (newQuantity <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = newQuantity;
      }
      this.saveCart(cart);
    }
    return cart;
  },

  // Find existing food item
  findFoodItem(name, size) {
    const cart = this.loadCart();
    return cart.findIndex(
      item => item.type !== 'ticket' && item.name === name && item.size === size
    );
  },

  // Add or update food item
  addOrUpdateFood(name, size, price, quantity) {
    const cart = this.loadCart();
    const existingIndex = cart.findIndex(
      item => item.type !== 'ticket' && item.name === name && item.size === size
    );

    if (existingIndex !== -1) {
      // Update existing item
      cart[existingIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push({ type: 'food', name, size, price, quantity });
    }

    this.saveCart(cart);
    this.startTimer(); // Start timer when food is added
    return cart;
  },

  // Timer Management
  startTimer() {
    const expiryTime = Date.now() + (CART_EXPIRY_MINUTES * 60 * 1000);
    localStorage.setItem(CART_TIMER_KEY, expiryTime.toString());
    this.initTimerCheck();
  },

  resetTimer() {
    if (!this.isEmpty()) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  },

  stopTimer() {
    localStorage.removeItem(CART_TIMER_KEY);
    if (window.cartTimerInterval) {
      clearInterval(window.cartTimerInterval);
      window.cartTimerInterval = null;
    }
    if (window.cartWarningShown) {
      window.cartWarningShown = false;
    }
  },

  getTimeRemaining() {
    const expiryTime = localStorage.getItem(CART_TIMER_KEY);
    if (!expiryTime) return null;
    
    const remaining = parseInt(expiryTime) - Date.now();
    return remaining > 0 ? remaining : 0;
  },

  isExpired() {
    const remaining = this.getTimeRemaining();
    return remaining !== null && remaining <= 0;
  },

  initTimerCheck() {
    // Clear any existing interval
    if (window.cartTimerInterval) {
      clearInterval(window.cartTimerInterval);
    }

    // Check every second
    window.cartTimerInterval = setInterval(() => {
      const remaining = this.getTimeRemaining();
      
      if (remaining === null) {
        clearInterval(window.cartTimerInterval);
        return;
      }

      // Show warning 30 seconds before expiry
      if (remaining <= WARNING_TIME_SECONDS * 1000 && remaining > 0 && !window.cartWarningShown) {
        window.cartWarningShown = true;
        this.showExpiryWarning(Math.ceil(remaining / 1000));
      }

      // Cart expired
      if (remaining <= 0) {
        this.handleExpiry();
        clearInterval(window.cartTimerInterval);
      }
    }, 1000);
  },

  showExpiryWarning(secondsLeft) {
    // Create warning modal if it doesn't exist
    if (!document.getElementById('cartExpiryWarning')) {
      const modal = document.createElement('div');
      modal.id = 'cartExpiryWarning';
      modal.className = 'cart-expiry-modal';
      modal.innerHTML = `
        <div class="cart-expiry-content">
          <div class="expiry-icon">
            <i class="fa-solid fa-clock"></i>
          </div>
          <h2>Cart Expiring Soon!</h2>
          <p>Your cart will expire in <span id="expirySeconds">${secondsLeft}</span> seconds.</p>
          <p>Complete your booking or your items will be removed.</p>
          <button class="extend-btn" onclick="CartUtils.extendTimer()">
            <i class="fa-solid fa-plus"></i> Keep My Cart
          </button>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const modal = document.getElementById('cartExpiryWarning');
    modal.style.display = 'flex';

    // Update countdown
    const countdownInterval = setInterval(() => {
      const remaining = this.getTimeRemaining();
      if (remaining === null || remaining <= 0) {
        clearInterval(countdownInterval);
        return;
      }
      
      const seconds = Math.ceil(remaining / 1000);
      const secondsSpan = document.getElementById('expirySeconds');
      if (secondsSpan) {
        secondsSpan.textContent = seconds;
      }
    }, 1000);
  },

  extendTimer() {
    this.resetTimer();
    window.cartWarningShown = false;
    const modal = document.getElementById('cartExpiryWarning');
    if (modal) {
      modal.style.display = 'none';
    }
  },

  handleExpiry() {
    this.clearCart();
    
    // Hide warning modal if shown
    const warningModal = document.getElementById('cartExpiryWarning');
    if (warningModal) {
      warningModal.style.display = 'none';
    }

    // Show expiry notification
    const expiryModal = document.createElement('div');
    expiryModal.className = 'cart-expiry-modal';
    expiryModal.innerHTML = `
      <div class="cart-expiry-content">
        <div class="expiry-icon expired">
          <i class="fa-solid fa-circle-xmark"></i>
        </div>
        <h2>Cart Expired</h2>
        <p>Your cart has been cleared due to inactivity.</p>
        <button class="continue-btn" onclick="this.closest('.cart-expiry-modal').remove(); location.reload();">
          Continue Browsing
        </button>
      </div>
    `;
    document.body.appendChild(expiryModal);
    expiryModal.style.display = 'flex';

    // Reload to update cart display
    setTimeout(() => {
      location.reload();
    }, 3000);
  }
};

// Make CartUtils available globally
if (typeof window !== 'undefined') {
  window.CartUtils = CartUtils;
  
  // Check for expired cart on page load
  document.addEventListener('DOMContentLoaded', () => {
    if (CartUtils.isExpired()) {
      CartUtils.handleExpiry();
    } else if (!CartUtils.isEmpty()) {
      CartUtils.initTimerCheck();
    }
  });
}
