const sqliteConnection = require("../../sqlite");

const createTableUsers = require("./createUsers");

async function migrationsRun() {
    const schemas = [
        createTableUsers
    ].join('');

    sqliteConnection()
    .then(db => db.exec(schemas))
    .catch(error => console.error(error))
}

module.exports = migrationsRun;