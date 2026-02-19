// Checkout page functionality
// Paystack Test Public Key
const PAYSTACK_PUBLIC_KEY = 'pk_test_43d318ebf2c999ae2ae6ff1fdad425643e84cce2'; // Replace with your test public key

document.addEventListener('DOMContentLoaded', function() {
    // Check if cart is empty
    const cart = CartUtils.loadCart();
    if (cart.length === 0) {
        window.location.href = 'index.html';
        return;
    }

    // Check if cart has at least one ticket
    const tickets = CartUtils.getItemsByType('ticket');
    if (tickets.length === 0) {
        showModal('You need to book a ticket before checkout. Food & drinks can only be purchased alongside a movie ticket.', {
            type: 'warning',
            title: 'Ticket Required'
        });
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        return;
    }

    // Initialize checkout
    setupFormHandlers();
    setupCartSidebar();
    updateCartDisplay();
    updateCartCount();
});

// Setup form handlers
function setupFormHandlers() {
    const form = document.getElementById('checkoutForm');
    const phoneInput = document.getElementById('phone');
    
    // Phone number formatting
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        e.target.value = value.substring(0, 15);
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            const btn = document.getElementById('submitBtn') || form.querySelector('button[type="submit"]');
            const originalContent = btn.innerHTML;
            
            // Show loading state
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
            
            // Store original content for restoration after payment popup closes
            btn.dataset.originalContent = originalContent;
            
            initializePaystackPayment();
        }
    });
}

// Validate form
function validateForm() {
    const email = document.getElementById('email').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // Basic validation
    if (!email || !firstName || !lastName || !phone) {
        showError('Please fill in all required fields');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        document.getElementById('email').classList.add('error');
        return false;
    }
    
    // Phone validation (basic)
    if (phone.length < 10) {
        showError('Please enter a valid phone number');
        document.getElementById('phone').classList.add('error');
        return false;
    }
    
    // Clear any error styling
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    return true;
}

// Show error message
function showError(message) {
    showModal(message, { type: 'error', title: 'Error' });
}

// Reset submit button to original state
function resetSubmitButton() {
    const btn = document.getElementById('submitBtn') || document.querySelector('button[type="submit"]');
    if (btn && btn.dataset.originalContent) {
        btn.innerHTML = btn.dataset.originalContent;
        btn.disabled = false;
    }
}

// Initialize Paystack payment
function initializePaystackPayment() {
    // Check if Paystack is loaded
    if (typeof PaystackPop === 'undefined') {
        showError('Payment service is unavailable. Please refresh the page and try again.');
        resetSubmitButton();
        return;
    }

    const email = document.getElementById('email').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // Calculate total with service fee
    const cart = CartUtils.loadCart();
    const subtotal = CartUtils.getTotal();
    const serviceFee = Math.round(subtotal * 0.05);
    const grandTotal = subtotal + serviceFee;
    
    // Convert to kobo (Paystack uses smallest currency unit)
    const amountInKobo = grandTotal * 100;
    
    // Generate reference
    const reference = generatePaymentReference();
    
    // Initialize Paystack payment
    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: amountInKobo,
        currency: 'NGN',
        ref: reference,
        metadata: {
            custom_fields: [
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: `${firstName} ${lastName}`
                },
                {
                    display_name: "Phone Number",
                    variable_name: "phone_number",
                    value: phone
                }
            ]
        },
        callback: function(response) {
            // Payment successful
            handlePaymentSuccess(response, email);
        },
        onClose: function() {
            // Payment window closed - restore button
            resetSubmitButton();
            showError('Payment cancelled. Please try again.');
        }
    });
    
    handler.openIframe();
}

// Generate payment reference
function generatePaymentReference() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ACE-${timestamp}-${random}`;
}

// Handle payment success
async function handlePaymentSuccess(response, email) {
    // Generate booking reference
    const bookingRef = generateBookingReference();
    
    // Get cart items before clearing
    const cart = CartUtils.loadCart();
    
    // Get customer info
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // Save each ticket booking to Firebase
    for (const item of cart) {
        if (item.type === 'ticket') {
            try {
                const bookingData = {
                    bookingReference: bookingRef,
                    paymentReference: response.reference,
                    movieId: item.movieId,
                    movie: item.movie,
                    date: item.rawDate || item.date, // Use raw date for queries
                    dateFormatted: item.date, // Keep formatted date for display
                    time: item.time,
                    seats: item.seatArray || item.seats.split(', '), // Array of seat labels
                    tickets: item.tickets,
                    price: item.price,
                    customerEmail: email,
                    customerName: `${firstName} ${lastName}`,
                    customerPhone: phone,
                    status: 'confirmed'
                };
                
                const result = await FirebaseBookings.saveBooking(bookingData);
                
                if (result.success) {
                    console.log(`Booking saved successfully: ${result.bookingId}`);
                } else {
                    console.error('Failed to save booking:', result.error);
                }
            } catch (error) {
                console.error('Error saving booking to Firebase:', error);
            }
        }
    }
    
    // Show success modal
    showSuccessModal(bookingRef, email);
    
    // Clear cart
    CartUtils.clearCart();
    updateCartDisplay();
    updateCartCount();
}

// Generate booking reference
function generateBookingReference() {
    const prefix = 'ACE';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
}

// Show success modal
function showSuccessModal(bookingRef, email) {
    const modal = document.getElementById('successModal');
    document.getElementById('bookingReference').textContent = bookingRef;
    document.getElementById('confirmEmail').textContent = email;
    modal.classList.add('show');
}

// Setup cart sidebar
function setupCartSidebar() {
    const cartSidebar = document.getElementById('cartSidebar');
    const displayCart = document.getElementById('displayCart');
    const displayMobileCart = document.getElementById('displayMobileCart');
    const closeCart = document.getElementById('closeCart');
    
    if (displayCart) {
        displayCart.addEventListener('click', () => {
            cartSidebar.classList.add('active');
        });
    }
    
    if (displayMobileCart) {
        displayMobileCart.addEventListener('click', () => {
            cartSidebar.classList.add('active');
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });
    }
    
    // Close cart when clicking outside
    cartSidebar.addEventListener('click', (e) => {
        if (e.target === cartSidebar) {
            cartSidebar.classList.remove('active');
        }
    });
}

// Update cart display in sidebar
function updateCartDisplay() {
    const cart = CartUtils.loadCart();
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Your cart is empty</p>
            </div>
        `;
        updateCartTotal();
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        if (item.type === 'ticket') {
            const totalTickets = (item.tickets.adult || 0) + (item.tickets.child || 0) + (item.tickets.senior || 0);
            
            cartItem.innerHTML = `
                <div class="cart-item-header">
                    <span class="cart-item-name">${item.movie}</span>
                    <button class="remove-item" onclick="removeFromCart(${index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-details">
                    <span>${item.date} at ${item.time}</span>
                    <span>${totalTickets} ticket${totalTickets > 1 ? 's' : ''}</span>
                    ${item.seats ? `<span>Seats: ${item.seats}</span>` : ''}
                </div>
                <div class="cart-item-footer">
                    <span class="cart-item-price">₦${item.price.toLocaleString()}</span>
                </div>
            `;
        } else if (item.type === 'food') {
            cartItem.innerHTML = `
                <div class="cart-item-header">
                    <span class="cart-item-name">${item.name}</span>
                    <button class="remove-item" onclick="removeFromCart(${index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-details">
                    <span>Size: ${item.size}</span>
                    <span>Quantity: ${item.quantity}</span>
                </div>
                <div class="cart-item-footer">
                    <span class="cart-item-price">₦${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `;
        }
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    updateCartTotal();
}

// Remove item from cart
function removeFromCart(index) {
    CartUtils.removeItem(index);
    updateCartDisplay();
    updateCartCount();
    
    // If cart is empty, redirect to home
    const cart = CartUtils.loadCart();
    if (cart.length === 0) {
        window.location.href = 'index.html';
    }
}

// Update cart total
function updateCartTotal() {
    const total = CartUtils.getTotal();
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartTotal) {
        cartTotal.textContent = `₦${total.toLocaleString()}`;
    }
    
    if (checkoutBtn) {
        checkoutBtn.disabled = total === 0;
    }
}

// Update cart count
function updateCartCount() {
    const count = CartUtils.getCount();
    const cartCount = document.getElementById('cartCount');
    const mobileCartCount = document.getElementById('mobileCartCount');
    
    if (cartCount) {
        cartCount.textContent = count;
    }
    
    if (mobileCartCount) {
        mobileCartCount.textContent = count;
    }
}

// Mobile menu functionality
document.getElementById('cartBtn')?.addEventListener('click', function() {
    document.getElementById('menuContainer').classList.add('show');
});

document.getElementById('closeBtn')?.addEventListener('click', function() {
    document.getElementById('menuContainer').classList.remove('show');
});
