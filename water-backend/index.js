// ==========================================
// AQUALYTICS MQTT BACKGROUND WORKER
// EMQX CLOUD + FIREBASE + LOCAL BUFFERING
// ==========================================

const mqtt = require('mqtt');
const admin = require('firebase-admin');
const fs = require('fs-extra');

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
// MQTT CLIENT SETUP
// ==========================================

const client = mqtt.connect(
  'mqtts://n4f81861.ala.asia-southeast1.emqxsl.com:8883',
  {

    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: 'backend-water-consumer-001',
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
// REPLAY BUFFERED DATA
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
// MQTT CONNECT EVENT
// ==========================================

client.on('connect', async () => {

  console.log('✅ MQTT Connected');

  // Replay local buffered data
  await flushBufferedData();

  // Subscribe with QoS1
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
// MQTT STATUS EVENTS
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

    // Parse MQTT JSON
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

      console.log('📤 Data saved');

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
// KEEP WORKER ALIVE LOG
// ==========================================

setInterval(() => {

  console.log('🟢 Worker Alive:', new Date().toISOString());

}, 60000);