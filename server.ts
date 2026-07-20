import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // Initialize Gemini client safely
  let ai: GoogleGenAI | null = null;
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI client successfully initialized server-side.");
  } else {
    console.log("No valid server-side GEMINI_API_KEY found. Falling back to client-provided keys or NLP local engine.");
  }

  // API endpoint for Fini's chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history, context, userApiKey } = req.body;

      // Select active AI instance (either server-side or client-passed API key)
      let activeAi = ai;
      if (userApiKey && userApiKey.trim() !== "") {
        try {
          activeAi = new GoogleGenAI({
            apiKey: userApiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });
        } catch (e) {
          console.error("Failed to initialize with client-provided API key:", e);
        }
      }
      
      // If no API key is available anywhere, let client know to use NLP local engine
      if (!activeAi) {
        return res.status(200).json({
          success: false,
          error: "API Key de Gemini no configurada.",
          fallback: true
        });
      }

      // Format the prompt with financial constraints and context
      const systemInstruction = `Eres Fini, el tierno y experto tutor de educación financiera de FinanzApp para jóvenes en el Perú.
Tu personalidad es analítica, técnica pero muy comprensible, amigable y motivadora, emulando la lógica de razonamiento de modelos avanzados como DeepSeek o Gemini.
Mantén siempre un foco financiero estricto. Si el usuario intenta hablar de temas no relacionados (como juegos ajenos, chistes aleatorios, etc.), reconduce elegantemente la conversación hacia las finanzas personales, el ahorro inteligente y el control de gastos con un toque analítico.

Contexto financiero actual del usuario:
- Saldo Disponible: S/. ${context?.balance?.toFixed(2) || '0.00'}
- Ahorros Acumulados: S/. ${context?.savings?.toFixed(2) || '0.00'}
- Meta de Ahorro: S/. ${context?.goal?.toFixed(2) || '0.00'}
- Historial de transacciones: ${JSON.stringify(context?.transactions || [])}

Estructura tus respuestas en un formato completo y elegante compuesto de 3 partes claramente distinguidas (puedes usar títulos en negrita):
1. Diagnóstico del Estado Actual: Analiza cuantitativa y cualitativamente la situación financiera o responde la pregunta técnica del usuario respecto a su estado actual.
2. Consejo Económico de Alta Fidelidad: Explica conceptos financieros profundos pero entendibles (costo de oportunidad, inflación, interés compuesto, presupuesto base cero, tasas de interés, fondos de emergencia, gastos hormiga, etc.) relacionados a la duda.
3. Acción Recomendada: Brinda de 2 a 3 pasos inmediatos, prácticos, medibles y realistas para el usuario.

Responde siempre en español de manera amigable pero con autoridad técnica. Si hay un gasto reciente preocupante, menciónalo como advertencia amistosa.`;

      const contents = [];
      
      // Include formatted history
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }
      }
      
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await activeAi.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({
        success: true,
        text: response.text
      });

    } catch (error: any) {
      console.error("Error in /api/chat:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server loaded as Express middleware.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
