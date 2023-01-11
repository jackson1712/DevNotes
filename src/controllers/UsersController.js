const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError")

class UsersControllers {
    async create (request, response) {
        const { id } = request.params;
        const { name, email, password } = request.body;

        const database = await sqliteConnection();

        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

        if(checkUserExists){
            throw new AppError("esse email já está em uso")
        }
        console.log("passou")

        return response.json();
    }
}

module.exports = UsersControllers;