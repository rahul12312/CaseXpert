const axios = require("axios");

async function testLogin() {
  try {
    const response = await axios.post("http://localhost:5000/api/auth/login", {
      email: "shreyash@gmail.com",
      password: "password123" // Assuming this might be the password
    });
    console.log("Status:", response.status);
    console.log("Data:", response.data);
  } catch (err) {
    console.log("Status:", err.response?.status);
    console.log("Message:", err.response?.data?.message);
  }
}

testLogin();
