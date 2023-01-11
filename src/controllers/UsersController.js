const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");
const { hash, compare } = require("bcryptjs");

class UsersControllers {
    async create (request, response) {
        const { name, email, password } = request.body;

        const database = await sqliteConnection();

        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

        if(checkUserExists){
            throw new AppError("esse email já está em uso")
        }

        const hashedPassword = await hash(password, 8)
        
        await database.run("INSERT INTO users (name, email, password) VALUES(?, ?, ?)", 
        [name, email, hashedPassword]);

        return response.json();
    }

    async update(request, response) {
        const { id } = request.params;
        const { name, email, password, old_password } = request.body;

        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

        if(!user) {
            throw new AppError("Usuário não encontrado")
        }

        const newEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email]);

        if(newEmail && newEmail.id !== user.id) {
            throw new AppError("Este email já está sendo usado.")
        }
        
        user.name = name ?? user.name;
        user.email = email ?? user.email;

        if(!password || !old_password) {
            throw new AppError("Você precisa digitar a antiga senha e a nova para poder atualizar.")
        }

        if( password & old_password) {
            const checkOldPassword = await compare(old_password, user.password);
            if(!checkOldPassword){
                throw new AppError("A senha antiga está inválida.")
            }

            user.password = await hash(password, 8);
        }

        await database.run(`
        UPDATE users SET
        name = ?,
        password = ?,
        email = ?,
        updated_at = DATETIME('now')
        WHERE id = ?`,
        [user.name, user.password, user.email, id]
        );

        return response.json();
    }
}

module.exports = UsersControllers;