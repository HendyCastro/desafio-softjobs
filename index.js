const express = require("express");
const cors = require("cors");
const { pool } = require("./database/index.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

const key = process.env.JWT_SECRET; 
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("servidor iniciado en el puerto 3000");
});

const verifyToken = (req, res, next) => {
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
        return res.status(401).json({ message: "No autorizado" });
    }
    const [bearer, token] = authorizationHeader.split(" ");

    if (bearer !== "Bearer" || !token) {
        return res.status(401).json({ message: "No autorizado" });    
    }
    try {
        jwt.verify(token, key)&&next();
        
    } catch (error) {
        console.log(error);
        return res.status(401).json({ message: "No autorizado!!!" });
    }
};

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

    const token = jwt.sign({ email: user.email, rol: user.rol, lenguage: user.lenguage },
         key
         
    );
    res.status(200).json(token);
   } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
}
});

app.get("/usuarios", verifyToken, async (req, res) => {
    
    try {
        const [_,token] = req.headers.authorization.split(" ");
        const query = "SELECT * FROM usuarios WHERE email = $1;";
        const {email}= jwt.verify(token, key);
        const { rows } = await pool.query(query, [email]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al obtener los usuarios" });
        
    }
});





