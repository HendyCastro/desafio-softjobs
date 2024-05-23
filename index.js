const express = require("express");
const cors = require("cors");
const { pool } = require("./database/index.js");
const bcrypt = require("bcryptjs");
const app = express();

app.use(cors());
app.use(express.json());

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

app.listen(3000, () => {
    console.log("servidor iniciado en el puerto 3000");
});



