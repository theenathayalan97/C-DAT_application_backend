const db = require("./postgres");
db.database.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("12345678");
    console.log("Failed to sync db: " + err);
  });