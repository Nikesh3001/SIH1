import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Add API routes here
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Real Backend Service Running" });
  });

  app.post("/api/threat-assessment", async (req, res) => {
    try {
      const { alert, camera } = req.body;
      
      const mapsPrompt = `Perform a rapid geospatial threat assessment for a perimeter breach alert.
Alert Category: ${alert.category}
Detected Object: ${alert.detectedObject}
Severity: ${alert.severity}
Location Coordinates: ${camera.lat}, ${camera.lng}
Camera Name: ${camera.name}

Analyze the location using Google Maps. Provide insights on the terrain, proximity to roads, nearby structures, or any geographical vulnerabilities. Formulate a quick tactical recommendation for the QRF. Keep it concise and professional.`;

      const searchPrompt = `Search for any recent security incidents, border context, or general information related to coordinates ${camera.lat}, ${camera.lng} or the region of Jammu & Kashmir border areas. Provide a 1-sentence quick contextual intel brief.`;

      const [mapsResponse, searchResponse] = await Promise.all([
        ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: mapsPrompt,
          tools: [{ googleMaps: {} }],
          toolConfig: { includeServerSideToolInvocations: true },
        }).catch(e => { console.error("Maps error", e); return null; }),
        ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: searchPrompt,
          tools: [{ googleSearch: {} }],
          toolConfig: { includeServerSideToolInvocations: true },
        }).catch(e => { console.error("Search error", e); return null; })
      ]);

      res.json({
        geospatialAnalysis: mapsResponse?.text || "Geospatial analysis unavailable.",
        intelBrief: searchResponse?.text || "No recent intel found.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate threat assessment" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
