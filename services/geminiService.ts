import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { UserPreferences } from "../types";

// Helper for encoding/decoding
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const SYSTEM_INSTRUCTION_BASE = `
You are Chef Mate, an intelligent Cooking AI Assistant.
Your role is to help users cook tasty, healthy, and affordable meals at home.

Your responsibilities:
1. Suggest recipes based on available ingredients, Veg/Non-Veg preference, Cuisine, Cooking time, and Skill level.
2. For every recipe, provide:
   - Recipe name
   - Ingredients list with quantity
   - Step-by-step cooking instructions in simple language
   - Cooking time
   - Serving size
   - Tips for better taste
   - Healthy alternatives (optional)
3. Special features:
   - Suggest recipes for students, bachelors, and families
   - Low-budget recipes
   - Diet plans (weight loss, weight gain, diabetic-friendly)
   - Festival and special occasion recipes
   - Leftover food recipes
4. Tone: Friendly, supportive, and easy to understand. Act like a helpful home chef, not a robot.
5. Safety: Avoid harmful cooking advice. Mention allergies if ingredients commonly cause them.

Always ask follow-up questions if ingredients, cuisine, or preferences are unclear.
Format your responses using clear Markdown (headings, bold text, lists).
`;

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiInstance;
};

export const createChatSession = (prefs: UserPreferences): Chat => {
  const ai = getAI();
  
  const prefString = `
    Current User Preferences:
    - Diet: ${prefs.diet}
    - Cuisine Preference: ${prefs.cuisine}
    - Skill Level: ${prefs.skillLevel}
    - Allergies: ${prefs.allergies || "None"}
    - Preferred Language: ${prefs.language}
  `;

  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_BASE + prefString,
      temperature: 0.7,
    },
  });
};

export const generateDishImage = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    // Using gemini-2.5-flash-image for standard generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high quality, appetizing food photography shot of: ${prompt}. Professional lighting, 4k.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};

export const generateSpeech = async (text: string): Promise<void> => {
  try {
    const ai = getAI();
    // Truncate text if it's too long to prevent massive latency/token usage for quick TTS
    const safeText = text.length > 500 ? text.substring(0, 500) + "..." : text;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: safeText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);

    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1,
    );
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputNode);
    source.start();

  } catch (error) {
    console.error("TTS generation failed:", error);
  }
};
