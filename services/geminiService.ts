import { GoogleGenAI } from "@google/genai";
import { Booking, Room } from "../types";

// Helper to get safe API key
const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
};

export const generateEmailDraft = async (booking: Booking, room: Room, type: 'CONFIRMATION' | 'WELCOME' | 'INVOICE'): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key missing. Please configure your API key.";

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    You are a professional hotel concierge assistant. 
    Write a polite, warm, and professional ${type.toLowerCase()} email for the following booking details.
    
    Guest Name: ${booking.guest?.fullName}
    Room: ${room.number} (${room.type})
    Check-in: ${booking.checkInDate}
    Check-out: ${booking.checkOutDate}
    Total Amount: $${booking.totalAmount}
    Travel Agency: ${booking.travelAgency?.name || 'Direct Booking'}
    
    Keep it concise but friendly. Do not include placeholders like [Your Name], sign it as "The NovaStay Team".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate email.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating content. Please try again later.";
  }
};

export const analyzeOccupancyTrends = async (bookings: Booking[]): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) return "API Key missing.";

  const ai = new GoogleGenAI({ apiKey });
  
  // Simplify data for token efficiency
  const summary = bookings.map(b => ({
    status: b.status,
    in: b.checkInDate,
    amount: b.totalAmount
  }));

  const prompt = `
    Analyze the following recent booking data for a hotel. 
    Provide 3 brief strategic insights regarding revenue, occupancy trends, or potential operational improvements.
    Data: ${JSON.stringify(summary.slice(0, 30))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error analyzing data.";
  }
};
