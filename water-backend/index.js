// Render Time Out Issue Resolved: 2026-05-14

const express = require('express');
const app = express();

const mqtt = require('mqtt');
const admin = require('firebase-admin');

const PORT = process.env.PORT || 3000;

// Firebase setup
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

// MQTT setup
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

    // Parse incoming JSON
    const data = JSON.parse(message.toString());

    // Keep ORIGINAL payload structure
    const payload = {
      ph: data.ph,
      temperature: data.temperature,
      tds: data.tds,
      turbidity: data.turbidity,
      timestamp: Date.now()
    };

    // Save to Firebase
    await db.ref('waterData').push(payload);

    if (process.env.NODE_ENV === "development") {
      console.log("📤 Data saved:", payload);
    } else {
      console.log("📤 Data saved");
    }

  } catch (error) {
    console.log("❌ Error processing MQTT message:", error);
  }
});

// Express route
app.get('/', (req, res) => {
  res.send('Aqualytics MQTT Service Running');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});