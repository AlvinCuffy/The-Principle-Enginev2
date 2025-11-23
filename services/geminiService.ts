import { GoogleGenAI, Type } from "@google/genai";
import { PrincipleResponse } from "../types";

// The "Brain" - Internal Knowledge Base
const BRAIN: Record<string, PrincipleResponse> = {
  "anxiety": {
    id: "mental-001",
    category: "MENTAL HEALTH",
    corePrinciple: "Peace is a weapon, not just a feeling.",
    sourceReference: "Philippians 4:6-7",
    actionPlan: [
      "Pause and physiologically reset (4-7-8 Breathing).",
      "Identify the specific fear; naming it removes its power.",
      "Perform a Gratitude Audit; list 3 tangible realities.",
      "Detach from the outcome; focus solely on the input.",
      "Engage in deep work for 20 minutes to break the loop.",
      "Serve someone else to shift perspective outward.",
      "Rest in sovereignty; accept what you cannot control."
    ],
    relatedQuestions: [
      { question: "How do I stop overthinking at night?", answer: "Write it down. Your brain loops because it fears forgetting." },
      { question: "Is anxiety a sign of lack of faith?", answer: "No. It is a signal that your reality needs re-anchoring." },
      { question: "How do I make decisions when stressed?", answer: "Never decide in the valley. Wait for the fog to lift." }
    ],
    additionalScriptures: [
      { verse: "Isaiah 26:3", text: "You will keep him in perfect peace, whose mind is stayed on You." },
      { verse: "1 Peter 5:7", text: "Casting all your care upon Him, for He cares for you." }
    ]
  },
  "profit": {
    id: "biz-001",
    category: "BUSINESS & FINANCE",
    corePrinciple: "Profit is a byproduct of Purpose.",
    sourceReference: "Matthew 6:33",
    actionPlan: [
      "Define the Mission clearly; money follows vision.",
      "Audit your time; eliminate non-revenue generating noise.",
      "Serve first; solve a real problem better than anyone else.",
      "Identify value leaks in your current operations.",
      "Systematize generosity; build giving into the margins.",
      "Measure impact, not just income.",
      "Reinvest in the vision, not just the lifestyle."
    ],
    relatedQuestions: [
      { question: "Is it wrong to want to be wealthy?", answer: "Wealth is a resource. The morality lies in the master." },
      { question: "How do I price my services fairly?", answer: "Price based on the value provided, not the hours worked." },
      { question: "When should I take a risk?", answer: "When the cost of inaction exceeds the cost of failure." }
    ],
    additionalScriptures: [
      { verse: "Proverbs 10:22", text: "The blessing of the Lord brings wealth, without painful toil for it." },
      { verse: "Deuteronomy 8:18", text: "But remember the Lord your God, for it is he who gives you the ability to produce wealth." }
    ]
  },
  "leadership": {
    id: "exec-001",
    category: "EXECUTIVE LEADERSHIP",
    corePrinciple: "To lead is to serve.",
    sourceReference: "Mark 10:45",
    actionPlan: [
      "Listen first; diagnosis precedes prescription.",
      "Remove barriers that hinder your team's performance.",
      "Clarify the vision; ambiguity breeds mediocrity.",
      "Empower ownership; delegate authority, not just tasks.",
      "Model the standard you expect from others.",
      "Celebrate others publicly; correct them privately.",
      "Protect the culture at all costs."
    ],
    relatedQuestions: [
      { question: "How do I handle a toxic employee?", answer: "Swiftly. Toxicity is cancer to culture; cut it out." },
      { question: "When is it time to step down?", answer: "When your ceiling becomes the organization's ceiling." },
      { question: "How do I build trust?", answer: "Consistency over time. Do what you say you will do." }
    ],
    additionalScriptures: [
      { verse: "Proverbs 29:18", text: "Where there is no vision, the people perish." },
      { verse: "Philippians 2:3", text: "Do nothing out of selfish ambition or vain conceit." }
    ]
  },
  "business idea": {
    id: "ent-001",
    category: "ENTREPRENEURSHIP",
    corePrinciple: "Success is not found by seeking a market, but by serving a need with integrity.",
    sourceReference: "Deuteronomy 28:8",
    actionPlan: [
      "Audit your inventory; list the skills currently in your hand.",
      "Identify a recurring frustration in your immediate circle.",
      "Shift focus from 'What can I sell?' to 'How can I serve?'",
      "Solve that specific problem for one person for free to prove efficacy.",
      "Gather raw feedback and refine the solution.",
      "Systematize the delivery; turn the act into a repeatable process.",
      "Launch with consistency; trust that the work of your hands will be established."
    ],
    relatedQuestions: [
      { question: "How do I know if my idea is good?", answer: "The market validates value. If it solves a real pain, it is good." },
      { question: "I feel stuck looking for the 'perfect' thing.", answer: "Perfection is paralysis. Do the next right thing with what you have." },
      { question: "What if I fail?", answer: "Failure is data, not a definition. Iterate and continue serving." }
    ],
    additionalScriptures: [
      { verse: "Ecclesiastes 9:10", text: "Whatever your hand finds to do, do it with all your might." },
      { verse: "Zechariah 4:10", text: "Do not despise these small beginnings, for the Lord rejoices to see the work begin." }
    ]
  },
  "marriage": {
    id: "rel-001",
    category: "RELATIONSHIPS",
    corePrinciple: "Love is not a contract; it is a covenant.",
    sourceReference: "Ephesians 5:25",
    actionPlan: [
      "Stop keeping score; a covenant has no ledger.",
      "Identify your spouse's primary stressor and remove it today.",
      "Listen without defending; validation is not agreement.",
      "Schedule the connection; intimacy requires intentionality.",
      "Speak their dialect (Love Language), not yours.",
      "Pray for them aloud; it makes resentment impossible.",
      "Out-serve one another daily."
    ],
    relatedQuestions: [
      { question: "We have grown apart.", answer: "Growth is directional. You must choose to grow in the same direction." },
      { question: "I don't feel 'in love' anymore.", answer: "Love is an action, not an emotion. Do the acts of love, and the feelings will follow." },
      { question: "How do we resolve conflict?", answer: "Attack the problem, not the person. You are on the same team." }
    ],
    additionalScriptures: [
      { verse: "1 Peter 4:8", text: "Above all, love each other deeply, because love covers over a multitude of sins." },
      { verse: "Ecclesiastes 4:9", text: "Two are better than one, because they have a good return for their labor." }
    ]
  }
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchPrinciple = async (query: string): Promise<PrincipleResponse> => {
  const normalizedQuery = query.toLowerCase().trim();

  // 1. Check the "Brain" for a curated match
  if (BRAIN[normalizedQuery]) {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate "Scanning"
    return BRAIN[normalizedQuery];
  }

  // 2. Hybrid AI Fallback (The "Infinite Archive")
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User Query: "${query}".

Role: You are the "Principle Engine," an ancient strategy system for Kingdom Leaders.
Goal: Convert the user's vague problem into a strict Military/Executive Protocol based on Scripture.

JSON Requirements:
1. category: High-level tactical domain (e.g., "WARFARE", "ASSET MANAGEMENT", "FAMILY GOVERNANCE").
2. corePrinciple: A brutal truth. Short. Punchy. (e.g., "Do not confuse patience with cowardice.")
3. sourceReference: One specific verse.
4. actionPlan: 7 Chronological Steps. 
   - Steps 1-2: Immediate triage (Stop the bleeding).
   - Steps 3-5: Strategic implementation (Build the solution).
   - Steps 6-7: Long-term fortification (Prevent recurrence).
   Start every step with a VERB (e.g., "Audit," "Confront," "Sever," "Invest").

Output strictly as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: "A broad uppercase category like 'LEADERSHIP' or 'EMOTIONAL INTELLIGENCE'" },
            corePrinciple: { type: Type.STRING },
            sourceReference: { type: Type.STRING },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            relatedQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                }
              }
            },
             additionalScriptures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  verse: { type: Type.STRING },
                  text: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const generatedData = JSON.parse(text);
    return {
      ...generatedData,
      id: `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}` // Generate ID for persistence
    };

  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error("NO_MATCH");
  }
};

export interface BlueprintResponse {
  purposeStatement: string;
  executionSteps: string[];
}

export const generateBlueprint = async (burden: string, hand: string, history: string): Promise<BlueprintResponse> => {
   try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
      Context: "The Blueprint" module of The Principle Engine.
      Inputs:
      - Burden (Problem they care about): "${burden}"
      - Hand (Skill/Asset they possess): "${hand}"
      - History (Experience/Backstory): "${history}"

      Task: Synthesize these three inputs into a Divine Assignment / Purpose Statement.
      
      Output JSON:
      1. purposeStatement: A powerful, 1-sentence declaration of their purpose. (Format: "You are called to use [Hand] to [Solve Burden] for [Audience]...")
      2. executionSteps: 3 immediate, high-level strategic moves to start walking in this purpose.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            purposeStatement: { type: Type.STRING },
            executionSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);
   } catch (e) {
     console.error(e);
     throw new Error("Failed to generate blueprint.");
   }
};