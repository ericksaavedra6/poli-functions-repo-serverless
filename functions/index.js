const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.getDrivers = onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection("drivers").limit(20).get();
    const data = snapshot.docs.map((doc) => doc.data());
    res.set("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

exports.getDriverById = onRequest(async (req, res) => {
  try {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({error: "El parámetro id es obligatorio"});
    }

    const doc = await db.collection("drivers").doc(id).get();

    res.set("Access-Control-Allow-Origin", "*");

    if (!doc.exists) {
      return res.status(404).json({error: "Piloto no encontrado"});
    }

    return res.json(doc.data());
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
});

exports.searchDriversByName = onRequest(async (req, res) => {
  try {
    const name = (req.query.name || "").toLowerCase().trim();

    if (!name) {
      return res.status(400).json({error: "El parámetro name es obligatorio"});
    }

    const snapshot = await db
        .collection("drivers")
        .orderBy("driverLower")
        .startAt(name)
        .endAt(name + "\uf8ff")
        .limit(20)
        .get();

    const data = snapshot.docs.map((doc) => doc.data());

    res.set("Access-Control-Allow-Origin", "*");
    return res.json(data);
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
});

exports.getChampions = onRequest(async (req, res) => {
  try {
    const snapshot = await db
        .collection("drivers")
        .where("champion", "==", true)
        .limit(20)
        .get();

    const data = snapshot.docs.map((doc) => doc.data());

    res.set("Access-Control-Allow-Origin", "*");
    return res.json(data);
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
});
