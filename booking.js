// Movie data
const movies = {
  ballerina: {
    title: "Ballerina",
    genre: "Action, Thriller",
    duration: "2h 5m",
    poster: "Ballerina.webp",
  },
  f1: {
    title: "F1: The Movie",
    genre: "Action, Drama",
    duration: "2h 10m",
    poster: "F1.webp",
  },
  superman: {
    title: "Superman",
    genre: "Action, Fantasy",
    duration: "2h 9m",
    poster: "Superman.webp",
  },
  jurassic: {
    title: "Jurassic World Rebirth",
    genre: "Action, Adventure",
    duration: "2h 14m",
    poster: "Jurassic-world.webp",
  },
  hos: {
    title: "Heads of State",
    genre: "Action",
    duration: "1h 53m",
    poster: "HeadsOfState.webp",
  },
  thunderbolts: {
    title: "Thunderbolts*",
    genre: "Action, Fantasy",
    duration: "2h 6m",
    poster: "Thunderbolts.webp",
  },
};

// Ticket prices (in Nigerian Naira)
const ticketPrices = {
  adult: 2500,
  child: 1500,
  senior: 2000,
};

// Booking state
const bookingState = {
  movie: null,
  date: null,
  time: null,
  tickets: {
    adult: 0,
    child: 0,
    senior: 0,
  },
  seats: [],
};

// Showtimes
const showtimes = ["10:00 AM", "1:30 PM", "4:00 PM", "7:00 PM", "9:30 PM"];

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Booking page loaded");
  console.log("URL:", window.location.href);
  console.log("URL params:", window.location.search);
  
  loadMovieFromURL();
  generateDates();
  generateShowtimes();
  setupTicketCounters();
  generateSeats();
  setupConfirmButton();
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

// Load movie from URL parameter
function loadMovieFromURL() {
  console.log("Loading movie from URL...");
  
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("movie");
  
  console.log("Movie ID from URL:", movieId);

  const moviePoster = document.getElementById("moviePoster");
  const movieTitle = document.getElementById("movieTitle");
  const movieGenre = document.getElementById("movieGenre");
  const movieDuration = document.getElementById("movieDuration");

  console.log("Elements found:", {
    moviePoster: !!moviePoster,
    movieTitle: !!movieTitle,
    movieGenre: !!movieGenre,
    movieDuration: !!movieDuration
  });

  if (!moviePoster || !movieTitle || !movieGenre || !movieDuration) {
    console.error("Movie elements not found in DOM");
    return;
  }

  if (movieId && movies[movieId]) {
    console.log("Movie found:", movies[movieId]);
    bookingState.movie = movies[movieId];
    moviePoster.src = bookingState.movie.poster;
    moviePoster.alt = bookingState.movie.title;
    movieTitle.textContent = bookingState.movie.title;
    movieGenre.textContent = bookingState.movie.genre;
    movieDuration.textContent = bookingState.movie.duration;
  } else {
    console.log("No valid movie ID, using default (ballerina)");
    // Default to first movie if no parameter
    bookingState.movie = movies.ballerina;
    moviePoster.src = bookingState.movie.poster;
    moviePoster.alt = bookingState.movie.title;
    movieTitle.textContent = bookingState.movie.title;
    movieGenre.textContent = bookingState.movie.genre;
    movieDuration.textContent = bookingState.movie.duration;
  }
  
  console.log("Movie loaded successfully:", bookingState.movie);
}

// Generate next 7 days
function generateDates() {
  const dateSelector = document.getElementById("dateSelector");
  
  if (!dateSelector) {
    console.error("Date selector element not found");
    return;
  }

  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dateOption = document.createElement("div");
    dateOption.className = "date-option";
    dateOption.dataset.date = date.toISOString().split("T")[0];

    const dayName = i === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    dateOption.innerHTML = `
      <span class="day">${dayName}</span>
      <span class="date">${dateStr}</span>
    `;

    dateOption.addEventListener("click", () => selectDate(dateOption));
    dateSelector.appendChild(dateOption);
  }
}

// Select date
function selectDate(element) {
  document.querySelectorAll(".date-option").forEach((el) => el.classList.remove("selected"));
  element.classList.add("selected");
  bookingState.date = element.dataset.date;

  // Enable showtimes (then filter based on current time if today)
  updateAvailableShowtimes();

  // Clear previously selected seats when date changes
  bookingState.seats = [];
  document.querySelectorAll('.seat.selected').forEach(seat => {
    seat.classList.remove('selected');
    seat.classList.add('available');
  });

  // Clear selected time if it's now disabled
  const selectedTime = document.querySelector('.showtime-option.selected');
  if (selectedTime && selectedTime.classList.contains('disabled')) {
    selectedTime.classList.remove('selected');
    bookingState.time = null;
  }

  // If a time is already selected, reload seats for the new date
  if (bookingState.time) {
    loadBookedSeatsFromFirebase();
  }

  updateSummary();
}

// Update available showtimes based on selected date
function updateAvailableShowtimes() {
  const selectedDate = bookingState.date; // Format: YYYY-MM-DD
  const now = new Date();
  const today = now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  document.querySelectorAll(".showtime-option").forEach((el) => {
    const timeStr = el.dataset.time;
    
    // If selected date is today, check if time has passed
    if (selectedDate === today) {
      const showDateTime = parseShowtime(timeStr);
      if (showDateTime <= now) {
        el.classList.add("disabled");
        el.classList.remove("selected");
      } else {
        el.classList.remove("disabled");
      }
    } else {
      // Future date - all times available
      el.classList.remove("disabled");
    }
  });
}

// Parse showtime string to Date object for comparison
function parseShowtime(timeStr) {
  const now = new Date();
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  
  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }
  
  const showTime = new Date(now);
  showTime.setHours(hours, minutes, 0, 0);
  return showTime;
}

// Generate showtimes
function generateShowtimes() {
  const showtimeSelector = document.getElementById("showtimeSelector");

  if (!showtimeSelector) {
    console.error("Showtime selector element not found");
    return;
  }

  showtimes.forEach((time) => {
    const showtimeOption = document.createElement("div");
    showtimeOption.className = "showtime-option disabled";
    showtimeOption.textContent = time;
    showtimeOption.dataset.time = time;

    showtimeOption.addEventListener("click", () => {
      if (!showtimeOption.classList.contains("disabled")) {
        selectShowtime(showtimeOption);
      }
    });

    showtimeSelector.appendChild(showtimeOption);
  });
}

// Select showtime
function selectShowtime(element) {
  document.querySelectorAll(".showtime-option").forEach((el) => el.classList.remove("selected"));
  element.classList.add("selected");
  bookingState.time = element.dataset.time;
  
  // Clear previously selected seats when time changes
  bookingState.seats = [];
  document.querySelectorAll('.seat.selected').forEach(seat => {
    seat.classList.remove('selected');
    seat.classList.add('available');
  });
  
  updateSummary();
  
  // Load booked seats from Firebase when both date and time are selected
  if (bookingState.date && bookingState.time) {
    loadBookedSeatsFromFirebase();
  }
}

// Setup ticket counters
function setupTicketCounters() {
  document.querySelectorAll(".increase").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      bookingState.tickets[type]++;
      updateTicketDisplay(type);
      updateSummary();
      checkSeatsNeeded();
    });
  });

  document.querySelectorAll(".decrease").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.type;
      if (bookingState.tickets[type] > 0) {
        bookingState.tickets[type]--;
        updateTicketDisplay(type);
        updateSummary();
        checkSeatsNeeded();
      }
    });
  });
}

// Update ticket display
function updateTicketDisplay(type) {
  document.getElementById(`${type}Count`).textContent = bookingState.tickets[type];
}

// Check if seats need to be selected
function checkSeatsNeeded() {
  const totalTickets = bookingState.tickets.adult + bookingState.tickets.child + bookingState.tickets.senior;
  const seatSection = document.getElementById("seatSection");

  if (totalTickets > 0) {
    seatSection.style.display = "block";
    
    // Auto-deselect extra seats if ticket count decreased
    if (bookingState.seats.length > totalTickets) {
      bookingState.seats = bookingState.seats.slice(0, totalTickets);
      updateSeatSelection();
    }
  } else {
    seatSection.style.display = "none";
    bookingState.seats = [];
  }
}

// Generate seats
function generateSeats() {
  const seatGrid = document.getElementById("seatGrid");
  const rows = 8;
  const seatsPerRow = 10;

  // Clear existing seats
  seatGrid.innerHTML = '';

  // Generate all seats (will mark booked ones later)
  for (let i = 0; i < rows * seatsPerRow; i++) {
    const seat = document.createElement("div");
    seat.className = "seat available";
    seat.dataset.seat = i;
    seat.addEventListener("click", () => toggleSeat(seat, i));
    seatGrid.appendChild(seat);
  }
}

// Load booked seats from Firebase
async function loadBookedSeatsFromFirebase() {
  if (!bookingState.movie || !bookingState.date || !bookingState.time) {
    console.log('Missing booking details, skipping seat load');
    return;
  }

  // Get movie ID from URL or bookingState
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("movie") || 'ballerina';

  console.log(`Loading booked seats for ${movieId} on ${bookingState.date} at ${bookingState.time}`);

  // First, reset all seats to available (clear any previous occupied seats)
  document.querySelectorAll('.seat').forEach(seat => {
    if (!seat.classList.contains('selected')) {
      seat.classList.remove('occupied');
      seat.classList.add('available');
      // Re-add click listener
      const seatNum = parseInt(seat.dataset.seat);
      const newSeat = seat.cloneNode(true);
      newSeat.addEventListener("click", () => toggleSeat(newSeat, seatNum));
      seat.replaceWith(newSeat);
    }
  });

  try {
    // Get booked seats from Firebase
    const bookedSeatLabels = await FirebaseBookings.getBookedSeats(movieId, bookingState.date, bookingState.time);
    
    // Convert seat labels (like "A1", "B5") back to seat numbers
    const bookedSeatNumbers = bookedSeatLabels.map(label => {
      const row = label.charCodeAt(0) - 65; // A=0, B=1, etc.
      const seatNum = parseInt(label.substring(1)) - 1; // 1-based to 0-based
      return row * 10 + seatNum;
    });

    console.log('Booked seat numbers:', bookedSeatNumbers);

    // Mark booked seats as occupied
    document.querySelectorAll('.seat').forEach(seat => {
      const seatNum = parseInt(seat.dataset.seat);
      
      if (bookedSeatNumbers.includes(seatNum)) {
        seat.classList.remove('available', 'selected');
        seat.classList.add('occupied');
        seat.replaceWith(seat.cloneNode(true)); // Remove click listener
      }
    });

    console.log(`Marked ${bookedSeatNumbers.length} seats as occupied`);
  } catch (error) {
    console.error('Error loading booked seats:', error);
  }
}

// Toggle seat selection
function toggleSeat(seatElement, seatNumber) {
  const totalTickets = bookingState.tickets.adult + bookingState.tickets.child + bookingState.tickets.senior;

  if (seatElement.classList.contains("selected")) {
    seatElement.classList.remove("selected");
    seatElement.classList.add("available");
    bookingState.seats = bookingState.seats.filter((s) => s !== seatNumber);
  } else if (bookingState.seats.length < totalTickets) {
    seatElement.classList.remove("available");
    seatElement.classList.add("selected");
    bookingState.seats.push(seatNumber);
  }

  updateSummary();
}

// Update seat selection display
function updateSeatSelection() {
  document.querySelectorAll(".seat").forEach((seat) => {
    const seatNum = parseInt(seat.dataset.seat);
    if (!seat.classList.contains("occupied")) {
      if (bookingState.seats.includes(seatNum)) {
        seat.classList.remove("available");
        seat.classList.add("selected");
      } else {
        seat.classList.remove("selected");
        seat.classList.add("available");
      }
    }
  });
}

// Update summary
function updateSummary() {
  // Update date
  if (bookingState.date) {
    const date = new Date(bookingState.date);
    document.getElementById("selectedDate").textContent = date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  } else {
    document.getElementById("selectedDate").textContent = "Not selected";
  }

  // Update time
  document.getElementById("selectedTime").textContent = bookingState.time || "Not selected";

  // Update tickets
  const totalTickets = bookingState.tickets.adult + bookingState.tickets.child + bookingState.tickets.senior;
  let ticketText = "";
  if (bookingState.tickets.adult > 0) ticketText += `${bookingState.tickets.adult} Adult, `;
  if (bookingState.tickets.child > 0) ticketText += `${bookingState.tickets.child} Child, `;
  if (bookingState.tickets.senior > 0) ticketText += `${bookingState.tickets.senior} Senior, `;
  
  document.getElementById("ticketSummary").textContent = 
    ticketText ? ticketText.slice(0, -2) : "0 tickets";

  // Update seats
  if (bookingState.seats.length > 0) {
    const seatLabels = bookingState.seats.map((s) => {
      const row = String.fromCharCode(65 + Math.floor(s / 10));
      const seat = (s % 10) + 1;
      return `${row}${seat}`;
    });
    document.getElementById("seatSummary").textContent = seatLabels.join(", ");
  } else {
    document.getElementById("seatSummary").textContent = "Not selected";
  }

  // Calculate total
  const total =
    bookingState.tickets.adult * ticketPrices.adult +
    bookingState.tickets.child * ticketPrices.child +
    bookingState.tickets.senior * ticketPrices.senior;

  document.getElementById("totalPrice").textContent = `₦${total.toLocaleString()}`;

  // Enable/disable confirm button
  const confirmBtn = document.getElementById("confirmBtn");
  const totalTicketsCount = bookingState.tickets.adult + bookingState.tickets.child + bookingState.tickets.senior;
  const isValid =
    bookingState.date &&
    bookingState.time &&
    totalTicketsCount > 0 &&
    bookingState.seats.length === totalTicketsCount;

  confirmBtn.disabled = !isValid;
}

// Setup confirm button
function setupConfirmButton() {
  document.getElementById("confirmBtn").addEventListener("click", async () => {
    const btn = document.getElementById("confirmBtn");
    const originalContent = btn.innerHTML;
    
    // Show loading state
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';
    
    try {
      await addBookingToCart();
    } finally {
      // Restore button
      btn.innerHTML = originalContent;
      btn.disabled = false;
    }
  });
}

// Add booking to cart
async function addBookingToCart() {
  // Get movie ID
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("movie") || 'ballerina';

  // Convert selected seat numbers to labels
  const seatLabels = bookingState.seats.map((s) => {
    const row = String.fromCharCode(65 + Math.floor(s / 10));
    const seat = (s % 10) + 1;
    return `${row}${seat}`;
  });

  // Check if seats are still available before adding to cart
  console.log('Checking seat availability before adding to cart...');
  const availabilityCheck = await FirebaseBookings.areSeatsAvailable(
    movieId,
    bookingState.date,
    bookingState.time,
    seatLabels
  );

  if (!availabilityCheck.available) {
    showModal(`Sorry! The following seats are no longer available: ${availabilityCheck.unavailableSeats.join(', ')}\n\nPlease select different seats.`, { type: 'warning', title: 'Seats Unavailable' });
    
    // Reload seats to show updated availability
    await loadBookedSeatsFromFirebase();
    
    // Clear selected seats
    bookingState.seats = [];
    updateSummary();
    return;
  }

  // Seats are available, proceed with booking
  const date = new Date(bookingState.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const total =
    bookingState.tickets.adult * ticketPrices.adult +
    bookingState.tickets.child * ticketPrices.child +
    bookingState.tickets.senior * ticketPrices.senior;

  const booking = {
    type: "ticket",
    movieId: movieId, // Add movieId for Firebase
    movie: bookingState.movie.title,
    date: date,
    rawDate: bookingState.date, // Keep raw date for Firebase queries
    time: bookingState.time,
    tickets: { ...bookingState.tickets },
    seats: seatLabels.join(", "),
    seatArray: seatLabels, // Keep array for Firebase
    price: total,
  };

  CartUtils.addItem(booking);
  updateCartDisplay();
  updateCartCount();
  showSuccessModal();
  
  // Reset booking form
  resetBookingForm();
}

// Reset booking form
function resetBookingForm() {
  // Reset tickets
  bookingState.tickets = { adult: 0, child: 0, senior: 0 };
  document.getElementById("adultCount").textContent = "0";
  document.getElementById("childCount").textContent = "0";
  document.getElementById("seniorCount").textContent = "0";
  
  // Reset seats
  bookingState.seats = [];
  document.querySelectorAll(".seat.selected").forEach((seat) => {
    seat.classList.remove("selected");
    seat.classList.add("available");
  });
  
  // Hide seat section
  document.getElementById("seatSection").style.display = "none";
  
  // Reset date and time
  document.querySelectorAll(".date-option").forEach((el) => el.classList.remove("selected"));
  document.querySelectorAll(".showtime-option").forEach((el) => {
    el.classList.remove("selected");
    el.classList.add("disabled");
  });
  
  bookingState.date = null;
  bookingState.time = null;
  
  updateSummary();
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
  const count = CartUtils.getCount();
  document.getElementById("cartCount").textContent = count;
  document.getElementById("mobileCartCount").textContent = count;
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

  // Check if cart has at least one ticket
  const tickets = CartUtils.getItemsByType('ticket');
  if (tickets.length === 0) {
    showModal("You need to book a ticket before checkout. Please select your seats and add to cart.", { type: 'warning', title: 'Ticket Required' });
    return;
  }
  
  // Redirect to checkout page
  window.location.href = "checkout.html";
  
  // Close cart
  document.getElementById("cartSidebar").classList.remove("active");
}

// Show success modal
function showSuccessModal() {
  const modal = document.getElementById("successModal");
  modal.style.display = "flex";
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    modal.style.display = "none";
  }, 3000);
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
