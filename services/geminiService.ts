
import { GoogleGenAI, Type } from "@google/genai";
import { TelemetryData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeRideData = async (telemetry: TelemetryData[]) => {
  const prompt = `Analyze the following Electric Unicycle (EUC) ride telemetry data. 
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
    contents: `The user asks: "${userQuery}". The current wheel state is: Speed ${currentWheelState.speed}km/h, Battery ${currentWheelState.battery}%, Temp ${currentWheelState.temperature}°C. Provide expert EUC advice.`,
    config: {
        systemInstruction: "You are an expert Electric Unicycle (EUC) technician with 10 years of experience. You know all about Begode, Kingsong, Inmotion, and Leaperkim wheels. Be concise, safety-oriented, and technical when necessary."
    }
  });

  return response.text;
};
