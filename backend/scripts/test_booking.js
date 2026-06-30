const axios = require("axios");

async function testBooking() {
  try {
    // 1. Login to get token
    const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
      email: "shreyash@gmail.com",
      password: "password123"
    });
    const token = loginRes.data.token;
    console.log("✅ Logged in!");

    // 2. Create a booking
    const bookingRes = await axios.post("http://localhost:5000/api/bookings/book", {
      lawyerId: "69c405ec04e3175cff51ac4a", 
      date: "2026-03-27",
      timeSlot: "10:00",
      description: "Test persistence shreyash final"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("✅ Booking Created:", bookingRes.data.success);
    console.log("Booking ID:", bookingRes.data.booking?._id || bookingRes.data.id);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.response?.data?.message || err.message);
    process.exit(1);
  }
}

testBooking();
