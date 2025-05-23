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
  origin: '*', // Allow all origins during development
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

// DELETE a single perizia
app.delete("/api/perizie/:id", async (req: Request, res: Response) => {
  const periziaId = req.params.id;
  
  if (!periziaId) {
    return res.status(400).json({
      success: false,
      message: "ID perizia mancante"
    });
  }
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const perizieCollection = db.collection("Perizie");
    
    console.log(`Attempting to delete perizia with ID: ${periziaId}`);
    
    // IMPORTANT: Make sure we're using string comparison if IDs are strings
    const result = await perizieCollection.deleteOne({ id: periziaId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Perizia non trovata"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Perizia eliminata con successo"
    });
  } catch (error) {
    console.error("Error deleting perizia:", error);
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione della perizia",

    });
  } finally {
    await client.close();
  }
});

// DELETE multiple perizie
// Endpoint per eliminare una singola perizia
// Route for deleting a single perizia by ID
app.delete("/api/perizie/:id", async (req: Request, res: Response) => {
  const periziaId = req.params.id;
  
  if (!periziaId) {
    return res.status(400).json({
      success: false,
      message: "ID perizia mancante"
    });
  }
  
  console.log("Eliminazione perizia con ID:", periziaId);
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const perizieCollection = db.collection("Perizie");
    
    // Delete the perizia using the id field
    const result = await perizieCollection.deleteOne({ id: periziaId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Perizia non trovata"
      });
    }
    
    console.log(`Perizia eliminata con ID: ${periziaId}`);
    
    res.status(200).json({
      success: true,
      message: "Perizia eliminata con successo"
    });
  } catch (error) {
    console.error("Errore nell'eliminazione della perizia:", error);
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione della perizia",
      error
    });
  } finally {
    await client.close();
  }
});

// Endpoint per eliminare multiple perizie
app.delete("/api/eliminaPerizie", async (req: Request, res: Response) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Lista di ID perizie mancante o non valida"
    });
  }
  
  console.log("Eliminazione multiple perizie con IDs:", ids);
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const perizieCollection = db.collection("Perizie");
    
    // Usa deleteMany con $in per eliminare documenti multipli
    const result = await perizieCollection.deleteMany({ id: { $in: ids } });
    
    console.log(`Eliminate ${result.deletedCount} perizie`);
    
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} perizie eliminate con successo`
    });
  } catch (error) {
    console.error("Errore nell'eliminazione delle perizie:", error);
    res.status(500).json({
      success: false,
      message: "Errore durante l'eliminazione delle perizie",
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
// Fix the user update endpoint
// Fix for the user update endpoint (around line 609)
app.patch("/api/users/:id", async (req: Request, res: Response) => {
  const userId = req.params.id;
  const updateData = req.body;
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "ID utente mancante"
    });
  }
  
  // Remove fields that shouldn't be modified directly
  if (updateData.password) delete updateData.password;
  if (updateData._id) delete updateData._id;
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("Users");
    
    // IMPORTANT FIX: Check if userId is a valid ObjectId before trying to convert it
    // Define query with proper union type
    type UserQuery = { username: string } | { _id: ObjectId };
    let query: UserQuery = { username: userId }; // Default to searching by username
    
    // Only try to use ObjectId if it's in the correct format
    if (/^[0-9a-fA-F]{24}$/.test(userId)) {
      query = { _id: new ObjectId(userId) } as UserQuery;
    }
    
    const result = await usersCollection.updateOne(query, { $set: updateData });
    
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

// Fix the user delete endpoint
// Fix the user delete endpoint
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
    
    // Define query with proper union type
    type UserQuery = { username: string } | { _id: ObjectId };
    let query: UserQuery = { username: userId }; // Default to username
    
    // Only try to use ObjectId if it's in the correct format
    if (/^[0-9a-fA-F]{24}$/.test(userId)) {
      query = { _id: new ObjectId(userId) } as UserQuery;
    }
    
    // Find user first to check role
    const user = await usersCollection.findOne(query);
    
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
    
    // Perform the deletion
    const result = await usersCollection.deleteOne(query);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Nessun utente eliminato"
      });
    }
    
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

// POST endpoint to create a new perizia
app.post("/api/perizie", async (req: Request, res: Response) => {
  const periziaData = req.body;
  
  // Validate required fields
  if (!periziaData || !periziaData.tipo || !periziaData.descrizione || 
      !periziaData.posizione || !periziaData.cliente || !periziaData.polizza) {
    return res.status(400).json({
      success: false,
      message: "Dati perizia insufficienti, i campi tipo, descrizione, posizione, cliente e polizza sono obbligatori"
    });
  }
  
  const client = new MongoClient(connectionString);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const perizieCollection = db.collection("Perizie");
    
    // Generate a unique ID if not provided
    if (!periziaData.id) {
      // Get current count to generate a sequential ID
      const count = await perizieCollection.countDocuments();
      const year = new Date().getFullYear();
      periziaData.id = `PRZ-${year}-${(count + 1).toString().padStart(3, '0')}`;
    }
    
    // Add default values for missing fields
    const newPerizia = {
      ...periziaData,
      data: periziaData.data || new Date().toISOString(),
      stato: periziaData.stato || "pending",
      ultimoAggiornamento: new Date().toISOString(),
      fotografie: periziaData.fotografie || []
    };
    
    // Insert the new perizia
    const result = await perizieCollection.insertOne(newPerizia);
    
    if (result.acknowledged) {
      res.status(201).json({
        success: true,
        message: "Perizia creata con successo",
        data: newPerizia
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