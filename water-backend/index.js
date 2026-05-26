// ==========================================
// AQUALYTICS BACKEND SERVICE
// EMQX CLOUD + FIREBASE + LOCAL BUFFERING
// Render Timeout Issue Resolved
// ==========================================

const express = require('express');
const app = express();

const mqtt = require('mqtt');
const admin = require('firebase-admin');
const fs = require('fs-extra');

const PORT = process.env.PORT || 3000;

// ==========================================
// FIREBASE SETUP
// ==========================================

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

// ==========================================
// LOCAL BUFFER FILE
// ==========================================

const BUFFER_FILE = './buffer.json';

// Create buffer file if not exists
if (!fs.existsSync(BUFFER_FILE)) {

  fs.writeJsonSync(BUFFER_FILE, []);
}

// ==========================================
// MQTT SETUP (EMQX CLOUD TLS)
// ==========================================

const client = mqtt.connect(
  'mqtt://broker.hivemq.com:1883',
  {

    //username: process.env.MQTT_USERNAME,

    //password: process.env.MQTT_PASSWORD,

    clientId: 'aqualytics-backend-' + Math.random().toString(16).substr(2, 8),

    clean: false,
    reconnectPeriod: 5000,
    rejectUnauthorized: false
  }
);

// ==========================================
// FIREBASE UPLOAD FUNCTION
// ==========================================

async function uploadToFirebase(payload) {

  try {

    await db.ref('waterData').push(payload);
    return true;
  } catch (err) {
    throw err;
  }
}

// ==========================================
// LOCAL BUFFER FUNCTION
// ==========================================

async function bufferLocally(payload) {

  try {
    let buffer = await fs.readJson(BUFFER_FILE);
    buffer.push(payload);
    await fs.writeJson(BUFFER_FILE, buffer);
    console.log('📁 Data buffered locally');
  } catch (err) {
    console.log('❌ Buffer Write Error:', err);
  }
}

// ==========================================
// FLUSH BUFFERED DATA
// ==========================================

async function flushBufferedData() {

  try {
    let buffer = await fs.readJson(BUFFER_FILE);
    if (buffer.length === 0) {
      console.log('✅ No buffered data');
      return;
    }
    console.log(`🔄 Replaying ${buffer.length} buffered messages`);
    let remaining = [];
    for (const payload of buffer) {
      try {
        await uploadToFirebase(payload);
        console.log('✅ Recovered buffered message');
      } catch (err) {
        console.log('❌ Replay failed');
        remaining.push(payload);
      }
    }
    await fs.writeJson(BUFFER_FILE, remaining);
    console.log('🧹 Buffer sync completed');
  } catch (err) {
    console.log('❌ Buffer Flush Error:', err);
  }
}

// ==========================================
// MQTT EVENTS
// ==========================================

client.on('connect', async () => {

  console.log('✅ MQTT Connected');

  // Flush old buffered data
  await flushBufferedData();

  // Subscribe
  client.subscribe(
    'water/quality',
    { qos: 1 },
    (err) => {

      if (err) {

        console.log('❌ MQTT Subscribe Error:', err);

      } else {

        console.log('📡 Subscribed to water/quality');
      }
    }
  );
});

// ==========================================
// MQTT RECONNECT EVENTS
// ==========================================

client.on('reconnect', () => {

  console.log('🔄 MQTT Reconnecting...');
});

client.on('offline', () => {

  console.log('⚠ MQTT Offline');
});

client.on('error', (err) => {

  console.log('❌ MQTT Error:', err);
});

// ==========================================
// MQTT MESSAGE HANDLER
// ==========================================

client.on('message', async (topic, message) => {

  try {

    console.log('📥 Raw MQTT Message:', message.toString());

    // Parse incoming JSON
    const data = JSON.parse(message.toString());

    // Create payload
    const payload = {

      ph: data.ph,

      temperature: data.temperature,

      tds: data.tds,

      turbidity: data.turbidity,

      timestamp: Date.now()
    };

    // ======================================
    // TRY FIREBASE UPLOAD
    // ======================================

    try {

      await uploadToFirebase(payload);

      if (process.env.NODE_ENV === 'development') {

        console.log('📤 Data saved:', payload);

      } else {

        console.log('📤 Data saved');
      }

    } catch (firebaseError) {

      console.log('⚠ Firebase Upload Failed');

      // Save locally
      await bufferLocally(payload);
    }

  } catch (error) {

    console.log('❌ Error processing MQTT message:', error);
  }
});

// ==========================================
// EXPRESS HEALTH ROUTE
// ==========================================

app.get('/', (req, res) => {

  res.send('Aqualytics MQTT Service Running');
});

// ==========================================
// HEALTH CHECK ROUTE
// ==========================================

app.get('/health', (req, res) => {

  res.status(200).json({

    status: 'OK',

    mqtt: client.connected ? 'connected' : 'disconnected',

    timestamp: new Date()
  });
});

// ==========================================
// START EXPRESS SERVER
// ==========================================

app.listen(PORT, () => {

  console.log(`🚀 Server running on port ${PORT}`);
});