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
const client = mqtt.connect('mqtt://broker.hivemq.com');

client.on('connect', () => {
  console.log('✅ MQTT Connected');

  client.subscribe('water/quality');
});

client.on('message', (topic, message) => {
  const data = message.toString();

  db.ref('waterData').push({
    value: data,
    time: Date.now()
  });

  console.log('📤 Data saved');
});

// Express route
app.get('/', (req, res) => {
  res.send('Aqualytics MQTT Service Running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});