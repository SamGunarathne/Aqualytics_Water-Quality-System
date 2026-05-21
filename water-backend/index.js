// Render Time Out Issue Resolved: 2026-05-14

const express = require('express');
const app = express();

const mqtt = require('mqtt');
const admin = require('firebase-admin');

const PORT = process.env.PORT || 3000;

// ==========================================
// 1. Firebase Admin Initialization
// ==========================================
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

// ==========================================
// 2. Apply Simple Security Rules for Demo
// ==========================================
async function applyDatabaseRules() {
  // Read-only for authenticated users, client-side writes blocked.
  // The Admin SDK bypasses `.write: false` automatically.
  const rules = {
    rules: {
      "waterData": {
        ".read": "auth != null",
        ".write": false
      }
    }
  };

  try {
    await db.setRules(rules);
    console.log('🔒 Database security rules applied successfully (Read-Only for clients)');
  } catch (error) {
    console.error('❌ Failed to deploy database rules:', error);
  }
}

// Automatically deploy rules when backend spins up
applyDatabaseRules();

// ==========================================
// 3. MQTT Broker Integration
// ==========================================
const client = mqtt.connect('mqtt://public-mqtt-broker.bevywise.com');

client.on('connect', () => {
  console.log('✅ MQTT Connected');

  client.subscribe('water/quality', (err) => {
    if (err) {
      console.log('❌ MQTT Subscribe Error:', err);
    } else {
      console.log('📡 Subscribed to water/quality');
    }
  });
});

client.on('message', async (topic, message) => {
  try {
    console.log("📥 Raw MQTT Message:", message.toString());

    // Parse incoming JSON string from ESP32
    const data = JSON.parse(message.toString());

    // Format structure and safely enforce numeric types
    const payload = {
      ph: Number(data.ph),
      temperature: Number(data.temperature),
      tds: Number(data.tds),
      turbidity: Number(data.turbidity),
      timestamp: Date.now() // Server-side fallback timestamp
    };

    // Push entry into Firebase 'waterData' node
    await db.ref('waterData').push(payload);

    if (process.env.NODE_ENV === "development") {
      console.log("📤 Data saved successfully:", payload);
    } else {
      console.log("📤 Data saved successfully");
    }

  } catch (error) {
    console.log("❌ Error processing MQTT message:", error);
  }
});

// ==========================================
// 4. Express Server Checkpoint
// ==========================================
app.get('/', (req, res) => {
  res.send('Aqualytics MQTT Service Running');
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server actively running on port ${PORT}`);
});