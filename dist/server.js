"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
const path = require('path');
/* ********************** MONGO CONFIG ********************* */
dotenv_1.default.config({ path: ".env" });
const connectionString = process.env.CONNECTION_STRING_ATLAS || "mongodb://localhost:27017";
const DB_NAME = "Progetto_rilievi_e_perizie";
/* ********************** HTTP server ********************** */
const port = 1338;
let paginaErrore;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
server.listen(port, () => {
    init();
    console.log(`Server listening on port ${port}`);
});
function init() {
    fs_1.default.readFile("./static/error.html", (err, data) => {
        if (!err) {
            paginaErrore = data.toString();
        }
        else {
            paginaErrore = "<h1>Risorsa non trovata</h1>";
        }
    });
}
/* ********************** Middleware ********************** */
app.use(function (req, res, next) {
    res.setHeader('Allow', 'OPTIONS, HEAD, GET, POST, PUT, PATCH, DELETE');
    next();
});
const whitelist = [
    'http://localhost:3000',
    // 'https://localhost:3001',
    'http://localhost:4200',
    'https://cordovaapp',
    'http://localhost:8100', // porta 8100 (default)
];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin)
            // browser direct call
            return callback(null, true);
        if (whitelist.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        else
            return callback(null, true);
    },
    credentials: true
};
app.use('/', (0, cors_1.default)(corsOptions));
// 1. Request log
app.use("/", (req, res, next) => {
    console.log(req.method + ": " + req.originalUrl);
    next();
});
// 2. Static resources
app.use("/", express_1.default.static("./static"));
// 3. Body params
app.use("/", express_1.default.json({ limit: "10mb" })); // Parsifica i parametri in formato json
app.use("/", express_1.default.urlencoded({ limit: "10mb", extended: true })); // Parsifica i parametri urlencoded
// 5. Params log
app.use("/", (req, res, next) => {
    if (Object.keys(req.query).length > 0) {
        console.log("--> GET params: " + JSON.stringify(req.query));
    }
    if (Object.keys(req.body).length > 0) {
        console.log("--> BODY params: " + JSON.stringify(req.body));
    }
    next();
});
/* ********************** Client routes ********************** */
app.get("/api/getCollections", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new mongodb_1.MongoClient(connectionString);
    yield client.connect();
    const db = client.db(DB_NAME);
    const request = db.listCollections().toArray();
    request.then((data) => {
        res.send(data);
    });
    request.catch((err) => {
        res.status(500).send(`Collection access error: ${err}`);
    });
    request.finally(() => {
        client.close();
    });
}));
app.get("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.query.username;
    const password = req.query.password;
    if (!username || !password) {
        return res.status(400).send("Missing username or password");
    }
    console.log(username, password);
    const client = new mongodb_1.MongoClient(connectionString);
    yield client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection("Users");
    const request = collection.find({
        username: username,
        password: password,
    }).toArray();
    request.then((data) => {
        if (data.length > 0) {
            res.send(data);
        }
        else {
            res.status(401).send("Credenziali non valide");
        }
    }).catch((err) => {
        res.status(500).send(`Collection access error: ${err}`);
    }).finally(() => {
        client.close();
    });
}));
app.patch("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password, firstLogin, role, createdAt } = req.body;
    if (!username || !email || !password || firstLogin === undefined || !role || !createdAt) {
        return res.status(400).send("Missing required fields");
    }
    const client = new mongodb_1.MongoClient(connectionString);
    yield client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("Users");
    const newUser = {
        username,
        email,
        password,
        firstLogin,
        role,
        createdAt: new Date(createdAt),
    };
    try {
        yield usersCollection.insertOne(newUser);
        res.status(200).send("User created successfully");
    }
    catch (error) {
        res.status(500).send(String(error));
    }
    finally {
        yield client.close();
    }
}));
app.patch("/api/users/password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, newPassword, firstLogin } = req.body;
    // Debug logging
    console.log("Password update request received:", { username, passwordLength: newPassword === null || newPassword === void 0 ? void 0 : newPassword.length });
    if (!username || !newPassword) {
        return res.status(400).send("Missing required fields");
    }
    const client = new mongodb_1.MongoClient(connectionString);
    try {
        yield client.connect();
        const db = client.db(DB_NAME);
        const usersCollection = db.collection("Users");
        // First check if the user exists and is on first login
        const user = yield usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        // If firstLogin is false in database, don't allow password change
        // unless explicitly overridden by admin (not implemented yet)
        if (user.firstLogin === false) {
            return res.status(403).json({
                success: false,
                message: "Password change not required for this user"
            });
        }
        // Update the password and set firstLogin to false
        const updateResult = yield usersCollection.updateOne({ username }, {
            $set: {
                password: newPassword,
                firstLogin: false
            }
        });
        if (updateResult.modifiedCount === 1) {
            res.status(200).json({
                success: true,
                message: "Password updated successfully"
            });
        }
        else {
            res.status(400).json({
                success: false,
                message: "Password update failed"
            });
        }
    }
    catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({
            success: false,
            message: `Error updating profile: ${error}`
        });
    }
    finally {
        yield client.close();
    }
}));
// Nuovo endpoint per ottenere tutte le perizie
app.get("/api/perizie", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new mongodb_1.MongoClient(connectionString);
    const collection = client.db(DB_NAME).collection("Perizie");
    const request = collection.find({}).toArray();
    console.log(request);
    request.then((data) => {
        if (data.length > 0) {
            res.send(data);
        }
        else {
            res.status(401).send("Credenziali non valide");
        }
    }).catch((err) => {
        res.status(500).send(`Collection access error: ${err}`);
    }).finally(() => {
        client.close();
    });
}));
// Endpoint per modificare una perizia esistente
app.patch("/api/perizie/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const periziaId = req.params.id;
    const updateData = req.body;
    if (!periziaId) {
        return res.status(400).send("ID perizia mancante");
    }
    // Validazione dei dati in ingresso
    if (Object.keys(updateData).length === 0) {
        return res.status(400).send("Nessun dato da aggiornare");
    }
    const client = new mongodb_1.MongoClient(connectionString);
    try {
        yield client.connect();
        const db = client.db(DB_NAME);
        const perizieCollection = db.collection("Perizie");
        // Verifica che la perizia esista
        const perizia = yield perizieCollection.findOne({ id: periziaId });
        if (!perizia) {
            return res.status(404).send("Perizia non trovata");
        }
        // Aggiorna la perizia
        const result = yield perizieCollection.updateOne({ id: periziaId }, { $set: updateData });
        if (result.modifiedCount === 0) {
            return res.status(400).send("Nessuna modifica effettuata");
        }
        res.status(200).json({
            success: true,
            message: "Perizia aggiornata con successo"
        });
    }
    catch (error) {
        console.error("Errore durante l'aggiornamento della perizia:", error);
        res.status(500).send(`Errore durante l'aggiornamento: ${error}`);
    }
    finally {
        yield client.close();
    }
}));
// Endpoint per eliminare una perizia
app.delete("/api/perizie/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const periziaId = req.params.id;
    if (!periziaId) {
        return res.status(400).send("ID perizia mancante");
    }
    const client = new mongodb_1.MongoClient(connectionString);
    try {
        yield client.connect();
        const db = client.db(DB_NAME);
        const perizieCollection = db.collection("Perizie");
        // Verifica che la perizia esista
        const perizia = yield perizieCollection.findOne({ id: periziaId });
        if (!perizia) {
            return res.status(404).send("Perizia non trovata");
        }
        // Elimina la perizia
        const result = yield perizieCollection.deleteOne({ id: periziaId });
        if (result.deletedCount === 0) {
            return res.status(400).send("Nessuna perizia eliminata");
        }
        res.status(200).json({
            success: true,
            message: "Perizia eliminata con successo"
        });
    }
    catch (error) {
        console.error("Errore durante l'eliminazione della perizia:", error);
        res.status(500).send(`Errore durante l'eliminazione: ${error}`);
    }
    finally {
        yield client.close();
    }
}));
// Endpoint per eliminare più perizie contemporaneamente
app.delete("/api/perizie", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).send("IDs perizie mancanti o formato non valido");
    }
    const client = new mongodb_1.MongoClient(connectionString);
    try {
        yield client.connect();
        const db = client.db(DB_NAME);
        const perizieCollection = db.collection("Perizie");
        // Elimina le perizie
        const result = yield perizieCollection.deleteMany({ id: { $in: ids } });
        res.status(200).json({
            success: true,
            message: `${result.deletedCount} perizie eliminate con successo`,
            count: result.deletedCount
        });
    }
    catch (error) {
        console.error("Errore durante l'eliminazione delle perizie:", error);
        res.status(500).send(`Errore durante l'eliminazione: ${error}`);
    }
    finally {
        yield client.close();
    }
}));
// Endpoint per creare una nuova perizia
app.post("/api/perizie", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const perizia = req.body;
    // Validazione dei dati
    if (!perizia || !perizia.id || !perizia.operatore || !perizia.tipo || !perizia.descrizione ||
        !perizia.posizione || !perizia.cliente) {
        return res.status(400).json({
            success: false,
            message: "Dati della perizia insufficienti o non validi"
        });
    }
    const client = new mongodb_1.MongoClient(connectionString);
    try {
        yield client.connect();
        const collection = client.db(DB_NAME).collection("Perizie");
        // Verifica che non esista già una perizia con lo stesso ID
        const existing = yield collection.findOne({ id: perizia.id });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Esiste già una perizia con questo ID"
            });
        }
        // Inserisci la nuova perizia
        const result = yield collection.insertOne(perizia);
        if (result.acknowledged) {
            res.status(201).json({
                success: true,
                message: "Perizia creata con successo",
                data: perizia
            });
        }
        else {
            throw new Error("Errore nell'inserimento della perizia");
        }
    }
    catch (error) {
        console.error("Errore nella creazione della perizia:", error);
        res.status(500).json({
            success: false,
            message: `Errore nella creazione della perizia: ${error}`
        });
    }
    finally {
        yield client.close();
    }
}));
// API per ottenere tutti gli utenti (gli operatori)
app.get("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new mongodb_1.MongoClient(connectionString);
    try {
        yield client.connect();
        const db = client.db(DB_NAME);
        const usersCollection = db.collection("Users");
        // Determina se filtrare solo per operatori o restituire tutti
        const query = req.query.role ? { role: req.query.role } : {};
        // Escludi le password dai risultati per sicurezza
        const options = { projection: { password: 0 } };
        const users = yield usersCollection.find(query, options).toArray();
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Errore nel recupero degli utenti:", error);
        res.status(500).json({
            success: false,
            message: `Errore nel recupero degli utenti: ${error}`
        });
    }
    finally {
        yield client.close();
    }
}));
// API per ottenere un singolo utente per ID
app.get("/api/users/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "ID utente mancante"
        });
    }
    const client = new mongodb_1.MongoClient(connectionString);
    try {
        yield client.connect();
        const db = client.db(DB_NAME);
        const usersCollection = db.collection("Users");
        // Cerca l'utente per ID (come _id o come _id convertito in ObjectId)
        const user = yield usersCollection.findOne({ _id: userId }, { projection: { password: 0 } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utente non trovato"
            });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Errore nel recupero dell'utente:", error);
        res.status(500).json({
            success: false,
            message: `Errore nel recupero dell'utente: ${error}`
        });
    }
    finally {
        yield client.close();
    }
}));
// API per creare un nuovo utente
app.post("/api/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body;
    if (!userData || !userData.username || !userData.email || !userData.firstName ||
        !userData.lastName || !userData.role) {
        return res.status(400).json({
            success: false,
            message: "Dati utente insufficienti"
        });
    }
    const client = new mongodb_1.MongoClient(connectionString);
    try {
        yield client.connect();
        const db = client.db(DB_NAME);
        const usersCollection = db.collection("Users");
        // Verifica che non esista già un utente con lo stesso username o email
        const existingUser = yield usersCollection.findOne({
            $or: [
                { username: userData.username },
                { email: userData.email }
            ]
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Username o email già in uso"
            });
        }
        // Aggiungi campi predefiniti
        const newUser = Object.assign(Object.assign({}, userData), { password: userData.password || "changeme", firstLogin: true, isActive: true, status: "Offline", lastLogin: null, createdAt: new Date().toISOString() });
        // Inserisci il nuovo utente
        const result = yield usersCollection.insertOne(newUser);
        if (result.acknowledged) {
            // Rimuovi la password dalla risposta
            const { password } = newUser, userWithoutPassword = __rest(newUser, ["password"]);
            res.status(201).json({
                success: true,
                message: "Utente creato con successo",
                data: Object.assign(Object.assign({}, userWithoutPassword), { _id: result.insertedId })
            });
        }
        else {
            throw new Error("Errore nell'inserimento dell'utente");
        }
    }
    catch (error) {
        console.error("Errore nella creazione dell'utente:", error);
        res.status(500).json({
            success: false,
            message: `Errore nella creazione dell'utente: ${error}`
        });
    }
    finally {
        yield client.close();
    }
}));
// API per aggiornare un utente esistente
app.patch("/api/users/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    const updateData = req.body;
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "ID utente mancante"
        });
    }
    // Rimuovi campi che non possono essere modificati direttamente
    if (updateData.password)
        delete updateData.password;
    if (updateData._id)
        delete updateData._id;
    const client = new mongodb_1.MongoClient(connectionString);
    try {
        yield client.connect();
        const db = client.db(DB_NAME);
        const usersCollection = db.collection("Users");
        // Aggiorna l'utente
        const result = yield usersCollection.updateOne({ _id: userId }, { $set: updateData });
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Utente non trovato"
            });
        }
        res.status(200).json({
            success: true,
            message: "Utente aggiornato con successo"
        });
    }
    catch (error) {
        console.error("Errore nell'aggiornamento dell'utente:", error);
        res.status(500).json({
            success: false,
            message: `Errore nell'aggiornamento dell'utente: ${error}`
        });
    }
    finally {
        yield client.close();
    }
}));
// API per eliminare un utente
app.delete("/api/users/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "ID utente mancante"
        });
    }
    const client = new mongodb_1.MongoClient(connectionString);
    try {
        yield client.connect();
        const db = client.db(DB_NAME);
        const usersCollection = db.collection("Users");
        // Verifica se l'utente esiste e non è l'ultimo admin
        const user = yield usersCollection.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utente non trovato"
            });
        }
        // Se l'utente è un admin, verifica che non sia l'ultimo
        if (user.role === "admin") {
            const adminCount = yield usersCollection.countDocuments({ role: "admin" });
            if (adminCount <= 1) {
                return res.status(400).json({
                    success: false,
                    message: "Impossibile eliminare l'ultimo amministratore"
                });
            }
        }
        // Elimina l'utente
        const result = yield usersCollection.deleteOne({ _id: userId });
        res.status(200).json({
            success: true,
            message: "Utente eliminato con successo"
        });
    }
    catch (error) {
        console.error("Errore nell'eliminazione dell'utente:", error);
        res.status(500).json({
            success: false,
            message: `Errore nell'eliminazione dell'utente: ${error}`
        });
    }
    finally {
        yield client.close();
    }
}));
