// Firebase Booking Management
// Handles saving and retrieving bookings from Firestore

const FirebaseBookings = {
  // Save a booking to Firestore
  async saveBooking(bookingData) {
    try {
      const docRef = await db.collection('bookings').add({
        ...bookingData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'confirmed'
      });
      
      console.log('Booking saved with ID:', docRef.id);
      return { success: true, bookingId: docRef.id };
    } catch (error) {
      console.error('Error saving booking:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all booked seats for a specific movie, date, and time
  async getBookedSeats(movieId, date, time) {
    try {
      const snapshot = await db.collection('bookings')
        .where('movieId', '==', movieId)
        .where('date', '==', date)
        .where('time', '==', time)
        .where('status', '==', 'confirmed')
        .get();

      const bookedSeats = [];
      snapshot.forEach(doc => {
        const booking = doc.data();
        if (booking.seats && Array.isArray(booking.seats)) {
          bookedSeats.push(...booking.seats);
        }
      });

      console.log(`Found ${bookedSeats.length} booked seats for ${movieId} on ${date} at ${time}`);
      return bookedSeats;
    } catch (error) {
      console.error('Error getting booked seats:', error);
      return [];
    }
  },

  // Check if specific seats are available
  async areSeatsAvailable(movieId, date, time, requestedSeats) {
    try {
      const bookedSeats = await this.getBookedSeats(movieId, date, time);
      
      // Check if any requested seat is already booked
      const unavailableSeats = requestedSeats.filter(seat => 
        bookedSeats.includes(seat)
      );

      if (unavailableSeats.length > 0) {
        console.log('Unavailable seats:', unavailableSeats);
        return { available: false, unavailableSeats };
      }

      return { available: true, unavailableSeats: [] };
    } catch (error) {
      console.error('Error checking seat availability:', error);
      return { available: false, error: error.message };
    }
  },

  // Get all bookings for a specific user email (optional)
  async getUserBookings(email) {
    try {
      const snapshot = await db.collection('bookings')
        .where('email', '==', email)
        .orderBy('createdAt', 'desc')
        .get();

      const bookings = [];
      snapshot.forEach(doc => {
        bookings.push({ id: doc.id, ...doc.data() });
      });

      return bookings;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      return [];
    }
  },

  // Real-time listener for seat updates (optional - for live updates)
  listenToBookings(movieId, date, time, callback) {
    return db.collection('bookings')
      .where('movieId', '==', movieId)
      .where('date', '==', date)
      .where('time', '==', time)
      .where('status', '==', 'confirmed')
      .onSnapshot(snapshot => {
        const bookedSeats = [];
        snapshot.forEach(doc => {
          const booking = doc.data();
          if (booking.seats && Array.isArray(booking.seats)) {
            bookedSeats.push(...booking.seats);
          }
        });
        callback(bookedSeats);
      });
  }
};

// Make FirebaseBookings available globally
window.FirebaseBookings = FirebaseBookings;
