const mqtt = require('mqtt');
const admin = require('firebase-admin');

// 🔐 Load Firebase Key
const serviceAccount = require('./aqualytics-649ed-firebase-adminsdk-fbsvc-c339c5b765.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://aqualytics-649ed-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

// 🌐 Connect MQTT
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log("MQTT Connected");
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

    // 📤 Push to Firebase
    db.ref('waterData').push(payload);

    console.log("Data saved:", payload);

  } catch (err) {
    console.error("Error:", err);
  }
});
