
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const admin = require("firebase-admin");

const serviceAccount = require("{firebase_key}");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function slugify(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseNumber(value) {
  if (value === undefined || value === null || value === "") return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
}

function parseArrayString(value) {
  if (!value || value === "nan") return [];
  try {
    const normalized = String(value).replace(/'/g, '"');
    const parsed = JSON.parse(normalized);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

async function importDrivers() {
  const results = [];
  const csvPath = path.join(__dirname, "../F1Drivers_Dataset.csv");

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (row) => {
      const driverName = row["Driver"];
      const id = slugify(driverName);

      const driver = {
        id,
        driver: driverName || "",
        driverLower: String(driverName || "").toLowerCase(),
        nationality: row["Nationality"] || "",
        seasons: parseArrayString(row["Seasons"]),
        championships: parseNumber(row["Championships"]),
        raceEntries: parseNumber(row["Race_Entries"]),
        raceStarts: parseNumber(row["Race_Starts"]),
        polePositions: parseNumber(row["Pole_Positions"]),
        raceWins: parseNumber(row["Race_Wins"]),
        podiums: parseNumber(row["Podiums"]),
        fastestLaps: parseNumber(row["Fastest_Laps"]),
        points: parseNumber(row["Points"]),
        active: parseBoolean(row["Active"]),
        championshipYears: parseArrayString(row["Championship Years"]),
        decade: parseNumber(row["Decade"]),
        poleRate: parseNumber(row["Pole_Rate"]),
        startRate: parseNumber(row["Start_Rate"]),
        winRate: parseNumber(row["Win_Rate"]),
        podiumRate: parseNumber(row["Podium_Rate"]),
        fastLapRate: parseNumber(row["FastLap_Rate"]),
        pointsPerEntry: parseNumber(row["Points_Per_Entry"]),
        yearsActive: parseNumber(row["Years_Active"]),
        champion: parseBoolean(row["Champion"]),
      };

      results.push(driver);
    })
    .on("end", async () => {
      try {
        const batchSize = 400;
        for (let i = 0; i < results.length; i += batchSize) {
          const batch = db.batch();
          const chunk = results.slice(i, i + batchSize);

          chunk.forEach((driver) => {
            const ref = db.collection("drivers").doc(driver.id);
            batch.set(ref, driver);
          });

          await batch.commit();
          console.log(`Lote cargado: ${i + chunk.length}/${results.length}`);
        }

        console.log("Carga completada correctamente.");
        process.exit(0);
      } catch (error) {
        console.error("Error cargando datos:", error);
        process.exit(1);
      }
    });
}

importDrivers();