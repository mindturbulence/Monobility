
import { GoogleGenAI, Type } from "@google/genai";
import { TelemetryData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeRideData = async (telemetry: TelemetryData[]) => {
  const prompt = `Analyze the following Electric Unicycle (EUC) ride telemetry data. 
  The rider is using a high-voltage performance wheel (potentially 126V, 134V, 151V, or 168V).
  Points: ${JSON.stringify(telemetry.slice(0, 50))}... 
  Provide a health report and efficiency summary.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: 'healthy, warning, or critical' },
            analysis: { type: Type.STRING, description: 'Summary of the ride data' },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            issues: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["status", "analysis", "recommendations", "issues"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return null;
  }
};

export const getWheelExpertAdvice = async (userQuery: string, currentWheelState: TelemetryData) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user asks: "${userQuery}". The current wheel state is: Speed ${currentWheelState.speed}km/h, Battery ${currentWheelState.battery}%, Temp ${currentWheelState.temperature}°C. Current Voltage is ${currentWheelState.voltage}V. Provide expert EUC advice.`,
    config: {
        systemInstruction: "You are an expert Electric Unicycle (EUC) technician. You have deep knowledge of modern wheels: Inmotion (V14, V13), Leaperkim (Sherman L, Lynx, Patton), Begode (ET-Max, Master series, Blitz), and Kingsong (F series, S22). You understand 100V to 168V systems, specialized boutique brands like Nosfet and Apex, and high-performance battery setups. Be technical, safety-oriented, and concise."
    }
  });

  return response.text;
};
