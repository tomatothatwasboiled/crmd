export interface AITriageResult {
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  unitsToDispatch: {
    name: string;
    type: 'police' | 'ambulance' | 'fire' | 'hazmat';
  }[];
  protocol: string;
}

export async function processEmergencyWithAI(userInput: string): Promise<AITriageResult> {
  const prompt = `
You are the Autonomous Criticality Engine for CrisisMind AI, an agentic emergency response system.
Analyze the following emergency report: "${userInput}"

Determine the severity (Low, Medium, High, or Critical), write a short professional description, decide which emergency units to deploy (choose unit types strictly from: police, ambulance, fire, hazmat), and outline an emergency protocol.

You MUST respond with a valid JSON object ONLY, using this exact format with no extra text or markdown formatting outside the JSON:
{
  "title": "Short title of the incident",
  "severity": "High",
  "description": "Professional summary of the situation",
  "unitsToDispatch": [
    { "name": "Fire Engine Unit Alpha", "type": "fire" },
    { "name": "Emergency Ambulance Unit 1", "type": "ambulance" }
  ],
  "protocol": "Autonomous emergency protocol instructions"
}
`;

  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    
    if (!apiKey) {
      throw new Error("Missing VITE_GROQ_API_KEY environment variable.");
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq server error: ${response.statusText}`);
    }

    const data = await response.json();
    const cleanText = data.choices[0].message.content.trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Groq Triage Error:', error);
    return {
      title: userInput.length > 50 ? userInput.substring(0, 50) + "..." : userInput,
      severity: 'High',
      description: 'Processed via local fallback due to connection error with Groq API. Check your API Key.',
      unitsToDispatch: [
        { name: 'Emergency Response Unit 1', type: 'police' },
        { name: 'Emergency Ambulance Unit 1', type: 'ambulance' }
      ],
      protocol: 'Standard emergency deployment initiated.'
    };
  }
}