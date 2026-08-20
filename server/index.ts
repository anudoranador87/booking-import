import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";
import imaps from "imap-simple";
import { simpleParser } from "mailparser";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. IMAP EMAIL PARSING API
// ==========================================
app.get("/api/emails/check", async (req, res) => {
  try {
    if (!process.env.IMAP_USER || !process.env.IMAP_PASSWORD || !process.env.IMAP_HOST) {
      return res.status(400).json({ error: "Credenciales IMAP no configuradas en el archivo .env" });
    }

    const config = {
      imap: {
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASSWORD,
        host: process.env.IMAP_HOST,
        port: parseInt(process.env.IMAP_PORT || "993"),
        tls: true,
        authTimeout: 3000,
      }
    };

    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    // Fetch emails from the last 24 hours
    const delay = 24 * 3600 * 1000;
    const yesterday = new Date(Date.now() - delay);
    const searchCriteria = [['SINCE', yesterday.toISOString()]];
    const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true };

    const messages = await connection.search(searchCriteria, fetchOptions);
    const emails = [];

    for (const item of messages) {
      const all = item.parts.find((p) => p.which === 'TEXT');
      const id = item.attributes.uid;
      const idHeader = "Imap-Id: "+id+"\r\n";
      
      if (all) {
        const mail = await simpleParser(idHeader + all.body);
        emails.push({
          subject: mail.subject,
          text: mail.text,
          date: mail.date
        });
      }
    }
    
    connection.end();
    res.json({ success: true, emails, count: emails.length });
  } catch (error: any) {
    console.error("IMAP Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. GOOGLE SHEETS SYNC API
// ==========================================
app.post("/api/sheets/sync", async (req, res) => {
  try {
    const { reservations, spreadsheetId, sheetName } = req.body;

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return res.status(400).json({ error: "Cuenta de Servicio de Google no configurada en el archivo .env" });
    }

    // Format private key (replace literal \n with actual newlines)
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Format data for Google Sheets
    // Columns: ID, Guest Name, Room, Type, Check In, Check Out, Price, Status
    const values = [
      ['ID', 'Huésped', 'Habitación', 'Tipo', 'Entrada', 'Salida', 'Precio', 'Estado'],
      ...reservations.map((r: any) => [
        r.id,
        r.guestName,
        r.roomNumber,
        r.roomType,
        r.checkIn,
        r.checkOut,
        r.totalPrice,
        r.status
      ])
    ];

    // Clear existing data (optional, or just append)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A:H`,
    });

    // Write new data
    const result = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });

    res.json({ success: true, updatedCells: result.data.updatedCells });
  } catch (error: any) {
    console.error("Google Sheets Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// STATIC FILES & ROUTING
// ==========================================
const server = createServer(app);

const staticPath =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "public")
    : path.resolve(__dirname, "..", "dist", "public");

app.use(express.static(staticPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(staticPath, "index.html"));
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
