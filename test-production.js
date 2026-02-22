// Quick test script to verify production backend
const PRODUCTION_URL = "https://chatzi-1m0m.onrender.com";

async function testProduction() {
  console.log("Testing production backend:", PRODUCTION_URL);
  console.log("=".repeat(60));

  // Test 1: Root endpoint
  try {
    console.log("\n1. Testing root endpoint...");
    const rootRes = await fetch(`${PRODUCTION_URL}/`);
    const rootText = await rootRes.text();
    console.log("✅ Root response:", rootText);
  } catch (error) {
    console.log("❌ Root check failed:", error.message);
  }

  // Test 2: Health check
  try {
    console.log("\n2. Testing health endpoint...");
    const healthRes = await fetch(`${PRODUCTION_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log("✅ Health check:", healthData);
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
  }

  // Test 3: Login with test user
  try {
    console.log("\n3. Testing login with tini@test.com...");
    const loginRes = await fetch(`${PRODUCTION_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "tini@test.com",
        password: "password123",
      }),
    });
    const loginData = await loginRes.json();
    
    if (loginData.success) {
      console.log("✅ Login successful");
      console.log("   User:", loginData.data.user.name);
      console.log("   Token:", loginData.data.token.substring(0, 20) + "...");

      // Test 4: Fetch contacts
      console.log("\n4. Testing contacts endpoint...");
      const contactsRes = await fetch(`${PRODUCTION_URL}/api/user/contacts`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginData.data.token}`,
        },
      });
      const contactsData = await contactsRes.json();
      
      if (contactsData.success) {
        console.log("✅ Contacts fetched:", contactsData.data.length, "users");
        contactsData.data.forEach((user) => {
          console.log("   -", user.name, `(${user.email})`);
        });
      } else {
        console.log("❌ Contacts fetch failed:", contactsData.msg);
      }
    } else {
      console.log("❌ Login failed:", loginData.msg);
      console.log("   This means the database might not be seeded");
      console.log("   Run: cd backend && npm run seed");
    }
  } catch (error) {
    console.log("❌ Login test failed:", error.message);
  }

  console.log("\n" + "=".repeat(60));
}

testProduction();
