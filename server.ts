"use strict";
import { Express } from "express";
import cors, { CorsOptions } from "cors";
import http from "http";
import fs from "fs";
import express, { Application, NextFunction, Request, Response } from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import { resourceLimits } from "worker_threads";
import { userInfo } from "os";
const path = require('path');

/* ********************** MONGO CONFIG ********************* */
dotenv.config({ path: ".env" });
const connectionString = process.env.CONNECTION_STRING_ATLAS || "mongodb://localhost:27017";
const DB_NAME = "Progetto_rilievi_e_perizie";

/* ********************** HTTP server ********************** */
const port = 1338;
let paginaErrore: string;
const app = express();
const server = http.createServer(app);
server.listen(port, () => {
  init();
  console.log(`Server listening on port ${port}`);
});
function init() {
  fs.readFile("./static/error.html", (err, data) => {
    if (!err) {
      paginaErrore = data.toString();
    } else {
      paginaErrore = "<h1>Risorsa non trovata</h1>";
    }
  });
}


/* ********************** Middleware ********************** */
app.use(function(req, res, next) {
  res.setHeader('Allow', 'OPTIONS, HEAD, GET, POST, PUT, PATCH, DELETE')
  next();
});
const whitelist = [
  'http://localhost:3000',
  // 'https://localhost:3001',
  'http://localhost:4200', // server angular
  'https://cordovaapp', // porta 443 (default)
  'http://localhost:8100', // porta 8100 (default)
];
const corsOptions: CorsOptions = {
  origin: function (origin, callback) {
    if (!origin)
      // browser direct call
      return callback(null, true);
    if (whitelist.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    } else return callback(null, true);
  },
  credentials: true
};
app.use('/', cors(corsOptions));

// 1. Request log
app.use("/", (req: Request, res: Response, next: NextFunction) => {
  console.log(req.method + ": " + req.originalUrl);
  next();
});

// 2. Static resources
app.use("/", express.static("./static"));

// 3. Body params
app.use("/", express.json({ limit: "10mb" })); // Parsifica i parametri in formato json
app.use("/", express.urlencoded({ limit: "10mb", extended: true })); // Parsifica i parametri urlencoded

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
app.get(
  "/api/getCollections",
  async (req: Request, res: Response, next: NextFunction) => {
    const client = new MongoClient(connectionString);
    await client.connect();
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
  }
);

app.get("/api/login", async (req: Request, res: Response) => {
  const username = req.query.username as string | undefined;
  const password = req.query.password as string | undefined;

  if (!username || !password) {
    return res.status(400).send("Missing username or password");
  }

  console.log(username, password);
  const client = new MongoClient(connectionString);
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection("Users");

  const request = collection.find({
    username: username,
    password: password,
  }).toArray();
  request.then((data) => {
    if (data.length > 0) {
      res.send(data);
    } else {
      res.status(401).send("Credenziali non valide");
    }
  }).catch((err) => {
    res.status(500).send(`Collection access error: ${err}`);
  }).finally(() => {
    client.close();
  });
});

app.patch("/api/users", async (req: Request, res: Response) => {
  const { username, email, password, firstLogin, role, createdAt } = req.body;

  if (!username || !email || !password || firstLogin === undefined || !role || !createdAt) {
    return res.status(400).send("Missing required fields");
  }

  const client = new MongoClient(connectionString);
  await client.connect();
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
    await usersCollection.insertOne(newUser);
    res.status(200).send("User created successfully");
  } catch (error) {
    res.status(500).send(String(error));
  } finally {
    await client.close();
  }
});

app.patch("/api/users/password", async (req: Request, res: Response) => {
  const { username, newPassword, firstLogin } = req.body;

  // Debug logging
  console.log("Password update request received:", { username, passwordLength: newPassword?.length });

  if (!username || !newPassword) {
    return res.status(400).send("Missing required fields");
  }

  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("Users");
    
    // First check if the user exists and is on first login
    const user = await usersCollection.findOne({ username });
    
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
    const updateResult = await usersCollection.updateOne(
      { username },
      { 
        $set: {
          password: newPassword,
          firstLogin: false
        }
      }
    );

    if (updateResult.modifiedCount === 1) {
      res.status(200).json({ 
        success: true, 
        message: "Password updated successfully" 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: "Password update failed" 
      });
    }
    
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ 
      success: false, 
      message: `Error updating profile: ${error}` 
    });
  } finally {
    await client.close();
  }
});

// Nuovo endpoint per ottenere tutte le perizie
app.get("/api/perizie", async (req: Request, res: Response) => {
  const client = new MongoClient(connectionString);
  const collection = client.db(DB_NAME).collection("Perizie");
  const request = collection.find({}).toArray();
  console.log(request);
  request.then((data) => {
    if (data.length > 0) {
      res.send(data);
    } else {
      res.status(401).send("Credenziali non valide");
    }
  }).catch((err) => {
    res.status(500).send(`Collection access error: ${err}`);
  }).finally(() => {
    client.close();
  });
});

// Endpoint per modificare una perizia esistente
app.patch("/api/perizie/:id", async (req: Request, res: Response) => {
  const periziaId = req.params.id;
  const updateData = req.body;
  
  if (!periziaId) {
    return res.status(400).send("ID perizia mancante");
  }
  
  // Validazione dei dati in ingresso
  if (Object.keys(updateData).length === 0) {
    return res.status(400).send("Nessun dato da aggiornare");
  }

  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const perizieCollection = db.collection("Perizie");
    
    // Verifica che la perizia esista
    const perizia = await perizieCollection.findOne({ id: periziaId });
    if (!perizia) {
      return res.status(404).send("Perizia non trovata");
    }
    
    // Aggiorna la perizia
    const result = await perizieCollection.updateOne(
      { id: periziaId },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return res.status(400).send("Nessuna modifica effettuata");
    }
    
    res.status(200).json({
      success: true,
      message: "Perizia aggiornata con successo"
    });
  } catch (error) {
    console.error("Errore durante l'aggiornamento della perizia:", error);
    res.status(500).send(`Errore durante l'aggiornamento: ${error}`);
  } finally {
    await client.close();
  }
});

// Endpoint per eliminare una perizia
app.delete("/api/perizie/:id", async (req: Request, res: Response) => {
  const periziaId = req.params.id;
  
  if (!periziaId) {
    return res.status(400).send("ID perizia mancante");
  }
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const perizieCollection = db.collection("Perizie");
    
    // Verifica che la perizia esista
    const perizia = await perizieCollection.findOne({ id: periziaId });
    if (!perizia) {
      return res.status(404).send("Perizia non trovata");
    }
    
    // Elimina la perizia
    const result = await perizieCollection.deleteOne({ id: periziaId });
    
    if (result.deletedCount === 0) {
      return res.status(400).send("Nessuna perizia eliminata");
    }
    
    res.status(200).json({
      success: true,
      message: "Perizia eliminata con successo"
    });
  } catch (error) {
    console.error("Errore durante l'eliminazione della perizia:", error);
    res.status(500).send(`Errore durante l'eliminazione: ${error}`);
  } finally {
    await client.close();
  }
});

// Endpoint per eliminare più perizie contemporaneamente
app.delete("/api/perizie", async (req: Request, res: Response) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).send("IDs perizie mancanti o formato non valido");
  }
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const perizieCollection = db.collection("Perizie");
    
    // Elimina le perizie
    const result = await perizieCollection.deleteMany({ id: { $in: ids } });
    
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} perizie eliminate con successo`,
      count: result.deletedCount
    });
  } catch (error) {
    console.error("Errore durante l'eliminazione delle perizie:", error);
    res.status(500).send(`Errore durante l'eliminazione: ${error}`);
  } finally {
    await client.close();
  }
});

// Endpoint per creare una nuova perizia
app.post("/api/perizie", async (req: Request, res: Response) => {
  const perizia = req.body;
  
  // Validazione dei dati
  if (!perizia || !perizia.id || !perizia.operatore || !perizia.tipo || !perizia.descrizione ||
      !perizia.posizione || !perizia.cliente) {
    return res.status(400).json({
      success: false,
      message: "Dati della perizia insufficienti o non validi"
    });
  }
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const collection = client.db(DB_NAME).collection("Perizie");
    
    // Verifica che non esista già una perizia con lo stesso ID
    const existing = await collection.findOne({ id: perizia.id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Esiste già una perizia con questo ID"
      });
    }
    
    // Inserisci la nuova perizia
    const result = await collection.insertOne(perizia);
    
    if (result.acknowledged) {
      res.status(201).json({
        success: true,
        message: "Perizia creata con successo",
        data: perizia
      });
    } else {
      throw new Error("Errore nell'inserimento della perizia");
    }
  } catch (error) {
    console.error("Errore nella creazione della perizia:", error);
    res.status(500).json({
      success: false,
      message: `Errore nella creazione della perizia: ${error}`
    });
  } finally {
    await client.close();
  }
});

// API per ottenere tutti gli utenti (gli operatori)
app.get("/api/users", async (req: Request, res: Response) => {
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("Users");
    
    // Determina se filtrare solo per operatori o restituire tutti
    const query = req.query.role ? { role: req.query.role } : {};
    
    // Escludi le password dai risultati per sicurezza
    const options = { projection: { password: 0 } };
    
    const users = await usersCollection.find(query, options).toArray();
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Errore nel recupero degli utenti:", error);
    res.status(500).json({
      success: false,
      message: `Errore nel recupero degli utenti: ${error}`
    });
  } finally {
    await client.close();
  }
});

// API per ottenere un singolo utente per ID
app.get("/api/users/:id", async (req: Request, res: Response) => {
  const userId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "ID utente mancante"
    });
  }
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("Users");
    
    // Cerca l'utente per ID (come _id o come _id convertito in ObjectId)
    const user = await usersCollection.findOne(
      { _id: userId },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utente non trovato"
      });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Errore nel recupero dell'utente:", error);
    res.status(500).json({
      success: false,
      message: `Errore nel recupero dell'utente: ${error}`
    });
  } finally {
    await client.close();
  }
});

// API per creare un nuovo utente
app.post("/api/users", async (req: Request, res: Response) => {
  const userData = req.body;
  
  if (!userData || !userData.username || !userData.email || !userData.firstName || 
      !userData.lastName || !userData.role) {
    return res.status(400).json({
      success: false,
      message: "Dati utente insufficienti"
    });
  }
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("Users");
    
    // Verifica che non esista già un utente con lo stesso username o email
    const existingUser = await usersCollection.findOne({
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
    const newUser = {
      ...userData,
      password: userData.password || "changeme", // Password temporanea
      firstLogin: true,
      isActive: true,
      status: "Offline",
      lastLogin: null,
      createdAt: new Date().toISOString()
    };
    
    // Inserisci il nuovo utente
    const result = await usersCollection.insertOne(newUser);
    
    if (result.acknowledged) {
      // Rimuovi la password dalla risposta
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        success: true,
        message: "Utente creato con successo",
        data: {
          ...userWithoutPassword,
          _id: result.insertedId
        }
      });
    } else {
      throw new Error("Errore nell'inserimento dell'utente");
    }
  } catch (error) {
    console.error("Errore nella creazione dell'utente:", error);
    res.status(500).json({
      success: false,
      message: `Errore nella creazione dell'utente: ${error}`
    });
  } finally {
    await client.close();
  }
});

// API per aggiornare un utente esistente
app.patch("/api/users/:id", async (req: Request, res: Response) => {
  const userId = req.params.id;
  const updateData = req.body;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "ID utente mancante"
    });
  }
  
  // Rimuovi campi che non possono essere modificati direttamente
  if (updateData.password) delete updateData.password;
  if (updateData._id) delete updateData._id;
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("Users");
    
    // Aggiorna l'utente
    const result = await usersCollection.updateOne(
      { _id: userId },
      { $set: updateData }
    );
    
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
  } catch (error) {
    console.error("Errore nell'aggiornamento dell'utente:", error);
    res.status(500).json({
      success: false,
      message: `Errore nell'aggiornamento dell'utente: ${error}`
    });
  } finally {
    await client.close();
  }
});

// API per eliminare un utente
app.delete("/api/users/:id", async (req: Request, res: Response) => {
  const userId = req.params.id;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "ID utente mancante"
    });
  }
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("Users");
    
    // Verifica se l'utente esiste e non è l'ultimo admin
    const user = await usersCollection.findOne({ _id: userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utente non trovato"
      });
    }
    
    // Se l'utente è un admin, verifica che non sia l'ultimo
    if (user.role === "admin") {
      const adminCount = await usersCollection.countDocuments({ role: "admin" });
      
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Impossibile eliminare l'ultimo amministratore"
        });
      }
    }
    
    // Elimina l'utente
    const result = await usersCollection.deleteOne({ _id: userId });
    
    res.status(200).json({
      success: true,
      message: "Utente eliminato con successo"
    });
  } catch (error) {
    console.error("Errore nell'eliminazione dell'utente:", error);
    res.status(500).json({
      success: false,
      message: `Errore nell'eliminazione dell'utente: ${error}`
    });
  } finally {
    await client.close();
  }
});
