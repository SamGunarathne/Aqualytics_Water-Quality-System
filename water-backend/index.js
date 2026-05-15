const mqtt = require('mqtt');
const admin = require('firebase-admin');

const mqtt = require('mqtt');
const admin = require('firebase-admin');

// 🔐 Load Firebase key from environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

const db = admin.database();

// 🌐 Connect MQTT
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log("✅ MQTT Connected");
  client.subscribe('water/quality');
});

client.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    const payload = {
      ph: data.ph,
      temperature: data.temperature,
      tds: data.tds,
      turbidity: data.turbidity,
      timestamp: Date.now()
    };

    db.ref('waterData').push(payload);

    if (process.env.NODE_ENV === "development") {
      console.log("📤 Data saved firebase:", payload);
    } else {
      console.log("📤 Data saved firebase");
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
  }
});