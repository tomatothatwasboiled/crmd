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

export async function processEmergencyWithPhi3(userInput: string): Promise<AITriageResult> {
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
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'phi3',
        prompt: prompt,
        stream: false,
        format: 'json'
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama server error: ${response.statusText}`);
    }

    const data = await response.json();
    const cleanText = data.response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Phi-3 Triage Error:', error);
    return {
      title: userInput,
      severity: 'High',
      description: 'Processed via local fallback due to connection error with Phi-3 Mini.',
      unitsToDispatch: [
        { name: 'Emergency Response Unit 1', type: 'police' },
        { name: 'Emergency Ambulance Unit 1', type: 'ambulance' }
      ],
      protocol: 'Standard emergency deployment initiated.'
    };
  }
}