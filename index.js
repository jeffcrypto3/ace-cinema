let currentIndex = 0;
const movieDisplay = document.getElementById("movieDisplay");
const heroTrailerModal = document.getElementById("heroTrailerModal");
const heroTrailerPlayer = document.getElementById("heroTrailerPlayer");
const closeHeroModal = document.getElementById("closeHeroModal");
const heroModalContainer = document.getElementById("heroModalContainer");

const movies = [
  {
    title: `Superman`,
    description: `Superman, a journalist in Metropolis, embarks on a journey to reconcile his Kryptonian heritage with his human upbringing as Clark Kent.`,
    watchMovie: `Buy tickets`,
    image: `superman.bg.webp`,
    trailer: `https://www.youtube.com/watch?v=uhUht6vAsMY`,
    movieId: `superman`,
  },
  {
    title: `Jurassic World Rebirth`,
    description: `Five years after the events of Jurassic World Dominion, covert operations expert Zora Bennett is contracted to lead a skilled team on a top-secret mission to secure genetic material from the world's three most massive dinosaurs. When Zora's operation intersects with a civilian family ...`,
    watchMovie: `Buy tickets`,
    image: `jurassic-world.bg.webp`,
    trailer: `https://www.youtube.com/watch?v=jan5CFWs9ic`,
    movieId: `jurassic`,
  },
  {
    title: `Thunderbolts*`,
    description: `Caught in a death trap, an unconventional team of antiheroes must embark on a dangerous mission that will force them to confront their pasts.`,
    watchMovie: `Buy tickets`,
    image: `thunderbolts.bg.webp`,
    trailer: `https://www.youtube.com/watch?v=VlaAD_F_6ao`,
    movieId: `thunderbolts`,
  },
  {
    title: `F1: The Movie`,
    description: `A Formula One driver comes out of retirement to mentor and team with a younger driver.`,
    watchMovie: `Buy tickets`,
    image: `F1.bg.webp`,
    trailer: `https://www.youtube.com/watch?v=CT2_P2DZBR0`,
    movieId: `f1`,
  },
  {
    title: `Ballerina`,
    description: `A young woman with killer skills goes out for revenge when her family is killed by hitmen.`,
    watchMovie: `Buy tickets`,
    image: `Ballerina.bg.webp`,
    trailer: `https://www.youtube.com/watch?v=0FSwsrFpkbw`,
    movieId: `ballerina`,
  },
  {
    title: `Heads of State`,
    description: `U.S. President Will Derringer and U.K. Prime Minister Sam Clarke, known for their public rivalry, must join forces to survive and stop a global conspiracy after Air Force One is shot down over enemy territory.`,
    watchMovie: `Buy tickets`,
    image: `HeadsOfState.bg.webp`,
    trailer: `https://www.youtube.com/watch?v=8J646zM7UM8`,
    movieId: `hos`,
  },
];

function displayMovie() {
  const movie = movies[currentIndex];
  movieDisplay.innerHTML = "";

  const movieDiv = document.createElement("div");
  movieDiv.className = "movie-style";
  movieDiv.style.backgroundImage = `
    linear-gradient(to right, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.1)),
    url(${movie.image})`;
  movieDiv.style.maxWidth = "100%";

  const movieInfo = document.createElement("div");
  movieInfo.id = "movieInfoContainer";

  const watchOrBuy = document.createElement("div");
  watchOrBuy.id = "watchStyling";

  const title = document.createElement("h1");
  title.textContent = movie.title;

  const description = document.createElement("p");
  description.textContent = movie.description;

  const watch = document.createElement("button");
  watch.textContent = movie.watchMovie;
  watch.addEventListener("click", () => {
    window.location.href = `booking.html?movie=${movie.movieId}`;
  });

  const trailerBtn = document.createElement("a");
  trailerBtn.textContent = "Watch Trailer";
  trailerBtn.id = "watchBtn";
  trailerBtn.addEventListener("click", (event) => {
    event.preventDefault();
    const trailerUrl = movie.trailer;
    const videoId = new URLSearchParams(new URL(trailerUrl).search).get("v");
    const embedLink = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    heroTrailerPlayer.src = embedLink;
    heroTrailerModal.style.display = "flex";
    heroModalContainer.style.display = "block";
  });

  movieInfo.appendChild(title);
  movieInfo.appendChild(description);

  watchOrBuy.appendChild(trailerBtn);
  watchOrBuy.appendChild(watch);

  movieDiv.appendChild(movieInfo);
  movieDiv.appendChild(watchOrBuy);
  movieDisplay.appendChild(movieDiv);
}

displayMovie();

const nxtBtn = document.getElementById("nxtBtn");
const prevBtn = document.getElementById("prevBtn");

nxtBtn.addEventListener("click", () => {
  currentIndex++;
  if (currentIndex >= movies.length) {
    currentIndex = 0;
  }
  displayMovie();
});

prevBtn.addEventListener("click", () => {
  currentIndex--;
  if (currentIndex < 0) {
    currentIndex = movies.length - 1;
  }
  displayMovie();
});

setInterval(() => {
  currentIndex++;
  if (currentIndex >= movies.length) {
    currentIndex = 0;
  }
  displayMovie();
}, 4500);

const cartBtn = document.getElementById("cartBtn");
const closeBtn = document.getElementById("closeBtn");

cartBtn.addEventListener("click", () => {
  menuContainer.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  menuContainer.style.display = "none";
});

closeHeroModal.addEventListener("click", () => {
  heroModalContainer.style.display = "none";
  heroTrailerPlayer.src = "";
});

const comingSoon = document.getElementById("cming-soon");

comingSoon.addEventListener("click", () => {
  upcoming.style.display = "block";
  displayFilm.style.display = "none";
  comingSoon.style.fontWeight = "600";
  comingSoon.style.color = "white";
  showingNow.style.color = "#696969";
});

const showingNow = document.getElementById("showingNow");

showingNow.addEventListener("click", () => {
  upcoming.style.display = "none";
  displayFilm.style.display = "block";
  showingNow.style.color = "white";
  comingSoon.style.color = "#696969";
});

// ballerinaPage.addEventListener("click", () => {
//   window.location.href = "ballerina.html";
// });
// f1Page.addEventListener("click", () => {
//   window.location.href = "f1.html";
// });
// hosPage.addEventListener("click", () => {
//   window.location.href = "headsofstate.html";
// });
// jurassicPage.addEventListener("click", () => {
//   window.location.href = "jurassic.html";
// });
// supermanPage.addEventListener("click", () => {
//   window.location.href = "superman.html";
// });
// thunderboltsPage.addEventListener("click", () => {
//   window.location.href = "thunderbolts.html";
// });

// index.js

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 150) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const movies = {
    ballerina: {
      title: "Ballerina",
      genre: "Action, Thriller",
      duration: "2h 5m",
      poster: "Ballerina.webp",
      synopsis:
        "A highly-trained assassin embarks on a deadly mission to avenge her family in a world of deception, violence, and redemption.",
      trailer: "https://www.youtube.com/watch?v=0FSwsrFpkbw",
      ticketUrl: "booking.html?movie=ballerina",
    },
    f1: {
      title: "F1: The Movie",
      genre: "Action, Drama",
      duration: "2h 10m",
      poster: "F1.webp",
      synopsis:
        "An inspiring tale of speed, rivalry, and passion that follows a young driver’s rise through the Formula One world.",
      trailer: "https://www.youtube.com/watch?v=CT2_P2DZBR0",
      ticketUrl: "booking.html?movie=f1",
    },
    superman: {
      title: "Superman",
      genre: "Action, Fantasy",
      duration: "2h 9m",
      poster: "Superman.webp",
      synopsis:
        "Superman, a journalist in Metropolis, embarks on a journey to reconcile his Kryptonian heritage with his human upbringing as Clark Kent.",
      trailer: "https://www.youtube.com/watch?v=uhUht6vAsMY",
      ticketUrl: "booking.html?movie=superman",
    },
    jurassic: {
      title: "Jurassic World Rebirth",
      genre: "Action, Adventure",
      duration: "2h 14m",
      poster: "Jurassic-world.webp",
      synopsis:
        "Five years after the events of Jurassic World Dominion, covert operations expert Zora Bennett is contracted to lead a skilled team on a top-secret mission...",
      trailer: "https://www.youtube.com/watch?v=jan5CFWs9ic",
      ticketUrl: "booking.html?movie=jurassic",
    },
    hos: {
      title: "Heads of State",
      genre: "Action",
      duration: "1h 53m",
      poster: "HeadsOfState.webp",
      synopsis:
        "U.S. President Will Derringer and U.K. Prime Minister Sam Clarke, known for their public rivalry, must join forces to stop a global conspiracy after Air Force One is shot down.",
      trailer: "https://www.youtube.com/watch?v=8J646zM7UM8",
      ticketUrl: "booking.html?movie=hos",
    },
    thunderbolts: {
      title: "Thunderbolts*",
      genre: "Action, Fantasy",
      duration: "2h 6m",
      poster: "Thunderbolts.webp",
      synopsis:
        "Caught in a death trap, an unconventional team of antiheroes must embark on a dangerous mission that will force them to confront their pasts.",
      trailer: "https://www.youtube.com/watch?v=VlaAD_F_6ao",
      ticketUrl: "booking.html?movie=thunderbolts",
    },
  };

  const modal = document.getElementById("movieModal");
  const closeModal = document.getElementById("closeMovieModal");

  const poster = document.getElementById("moviePoster");
  const title = document.getElementById("movieTitle");
  const genre = document.getElementById("movieGenre");
  const duration = document.getElementById("movieDuration");
  const synopsis = document.getElementById("movieSynopsis");
  const bookBtn = document.getElementById("bookTicketBtn");
  const trailerBtn = document.getElementById("watchTrailerBtn");

  const trailerModal = document.getElementById("movieTrailerModal");
  const trailerPlayer = document.getElementById("movieTrailerPlayer");
  const closeTrailerModal = document.getElementById("closeMovieTrailer");

  // Handle clicking a movie
  document.querySelectorAll("#filmDisplay > div").forEach((movieCard) => {
    movieCard.addEventListener("click", () => {
      const id = movieCard.id.replace("Page", "");
      const movie = movies[id];
      if (!movie) return;

      poster.src = movie.poster;
      poster.alt = movie.title;
      title.textContent = movie.title;
      genre.textContent = movie.genre;
      duration.textContent = movie.duration;
      synopsis.textContent = movie.synopsis;

      // Store current movie data for button handlers
      bookBtn.dataset.ticketUrl = movie.ticketUrl;
      trailerBtn.dataset.trailerUrl = movie.trailer;

      modal.style.display = "flex";
    });
  });

  // Book Ticket button handler (one-time setup)
  bookBtn.addEventListener("click", () => {
    window.location.href = bookBtn.dataset.ticketUrl;
  });

  // Watch Trailer button handler (one-time setup)
  trailerBtn.addEventListener("click", () => {
    const trailerUrl = trailerBtn.dataset.trailerUrl;
    const videoId = new URLSearchParams(new URL(trailerUrl).search).get("v");
    const embedLink = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    trailerPlayer.src = embedLink;
    trailerModal.style.display = "flex";
    // Don't hide the parent modal - the trailer modal is inside it
  });

  // Close Movie Modal
  closeModal.onclick = () => {
    modal.style.display = "none";
    trailerModal.style.display = "none";
    trailerPlayer.src = "";
  };

  // Close modal when clicking outside
  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      trailerModal.style.display = "none";
      trailerPlayer.src = "";
    }
    if (e.target === trailerModal) {
      trailerModal.style.display = "none";
      trailerPlayer.src = "";
    }
  };

  // Close Trailer Modal
  closeTrailerModal.onclick = () => {
    trailerModal.style.display = "none";
    trailerPlayer.src = "";
    // No need to reopen movie modal - it's already open (parent)
  };

  // ESC key to close modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (trailerModal.style.display === "flex") {
        trailerModal.style.display = "none";
        trailerPlayer.src = "";
        // Movie modal stays open
      } else if (modal.style.display === "flex") {
        modal.style.display = "none";
        trailerModal.style.display = "none";
        trailerPlayer.src = "";
      }
    }
  });

  // Cart functionality
  const cartSidebar = document.getElementById("cartSidebar");
  const displayCart = document.getElementById("displayCart");
  const displayMobileCart = document.getElementById("displayMobileCart");
  const closeCart = document.getElementById("closeCart");

  function updateCartDisplay() {
    const cart = CartUtils.loadCart();
    const cartItemsDiv = document.getElementById("cartItems");

    if (cart.length === 0) {
      cartItemsDiv.innerHTML = `
        <div class="empty-cart">
          <i class="fa-solid fa-cart-shopping"></i>
          <p>Your cart is empty</p>
        </div>
      `;
    } else {
      cartItemsDiv.innerHTML = cart
        .map((item, index) => {
          if (item.type === "ticket") {
            const totalTickets = (item.tickets.adult || 0) + (item.tickets.child || 0) + (item.tickets.senior || 0);
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
                  ${totalTickets} ticket(s)<br>
                  Seats: ${item.seats}
                </div>
                <div class="cart-item-footer">
                  <span class="cart-item-price">₦${item.price.toLocaleString()}</span>
                </div>
              </div>
            `;
          } else {
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
        })
        .join("");
    }
    updateCartTotal();
  }

  function updateCartTotal() {
    const total = CartUtils.getTotal();
    const cartTotal = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (cartTotal) {
      cartTotal.textContent = `₦${total.toLocaleString()}`;
    }

    if (checkoutBtn) {
      checkoutBtn.disabled = total === 0;
    }
  }

  function updateCartCount() {
    const count = CartUtils.getCount();
    const cartCount = document.getElementById("cartCount");
    const mobileCartCount = document.getElementById("mobileCartCount");

    if (cartCount) {
      cartCount.textContent = count;
    }
    if (mobileCartCount) {
      mobileCartCount.textContent = count;
    }
  }

  function setupCartSidebar() {
    if (displayCart) {
      displayCart.addEventListener("click", () => {
        cartSidebar.classList.add("active");
        updateCartDisplay();
        updateCartCount();
      });
    }

    if (displayMobileCart) {
      displayMobileCart.addEventListener("click", () => {
        cartSidebar.classList.add("active");
        updateCartDisplay();
        updateCartCount();
      });
    }

    if (closeCart) {
      closeCart.addEventListener("click", () => {
        cartSidebar.classList.remove("active");
      });
    }

    // Close cart when clicking outside
    cartSidebar.addEventListener("click", (e) => {
      if (e.target === cartSidebar) {
        cartSidebar.classList.remove("active");
      }
    });

    // Checkout button handler
    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", () => {
        processCheckout();
      });
    }
  }

  window.removeFromCart = function (index) {
    CartUtils.removeItem(index);
    updateCartDisplay();
    updateCartCount();
  };

  window.processCheckout = function () {
    const cart = CartUtils.loadCart();
    if (cart.length === 0) {
      showModal("Your cart is empty! Please add items before checking out.", { type: 'warning', title: 'Empty Cart' });
      return;
    }

    // Redirect to checkout page
    window.location.href = "checkout.html";
  };

  // Initialize cart on page load
  updateCartDisplay();
  updateCartCount();
  setupCartSidebar();
});
