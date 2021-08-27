const MockDatabaseService = require("./class.mock.database.service");
const FirestoreDatabaseService = require("./class.firestore.database.service");
let db;
if(!!process.env.TESTING) {
    db = new MockDatabaseService();
} else {
    db = new FirestoreDatabaseService();
}

module.exports = db;
