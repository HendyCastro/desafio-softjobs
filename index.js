const express = require("express");
const cors = require("cors");
const { pool } = require("./database/index.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

app.use(cors());
app.use(express.json());

app.listen(3000, () => {
    console.log("servidor iniciado en el puerto 3000");
});

app.post("/usuarios", async (req, res) => {
    try {
        const { email, password, rol, lenguage } = req.body;
        const query = "INSERT INTO usuarios (id,email, password, rol, lenguage) VALUES (DEFAULT, $1, $2, $3, $4) RETURNING *;";
        const values = [email, bcrypt.hashSync(password), rol, lenguage];
        const { rows } = await pool.query(query, values);
        res.status(201).json({id: rows[0].id, email: rows [0].email,});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al registrar el usuario" });
        
    }
});

app.post("/login", async (req, res) => {    
   try {
    const { email, password } = req.body;
    const query = "SELECT * FROM usuarios WHERE email = $1;";
    const values = [email];
    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
        return res.status(401).json({ message: "Credenciales inválidas" });
    }
    const user = rows[0];
    if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Credenciales inválidas" });
    }
    const key = "llaveSecreta";

    const token = jwt.sign({ email: user.email, rol: user.rol, lenguage: user.lenguage },
         key
    );

    res.status(200).json(token);
   } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
    
}
    });





