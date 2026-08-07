import React, { useState } from 'react';
import API from '../services/api';
import { processEmergencyWithPhi3 } from '../services/triageService';

export default function IncidentForm() {
  const [userInput, setUserInput] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Example coordinates (you can replace these with real map coordinates if you have them)
    const latitude = 37.7749;
    const longitude = -122.4194;

    try {
      // 1. Analyze input text using local Phi-3 Mini
      const aiAnalysis = await processEmergencyWithPhi3(userInput);

      // 2. Format incident structure
      const newIncident = {
        id: `INC-${Math.floor(100 + Math.random() * 900)}`,
        title: aiAnalysis.title,
        severity: aiAnalysis.severity,
        description: aiAnalysis.description,
        protocol: aiAnalysis.protocol,
        units: aiAnalysis.unitsToDispatch,
        lat: latitude,
        lng: longitude,
        status: 'Active',
        timestamp: new Date().toLocaleTimeString()
      };

      // 3. Save directly into your SQLite database via Express backend
      const response = await API.saveIncidentToSQL(newIncident);
      console.log('Saved to SQL database:', response);
      
      // Clear input after successful submit
      setUserInput('');
    } catch (error) {
      console.error('Submission pipeline failed:', error);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} style={{ padding: '20px' }}>
      <h2>Report Emergency</h2>
      <input 
        type="text" 
        value={userInput} 
        onChange={(e) => setUserInput(e.target.value)} 
        placeholder="Describe the emergency..." 
        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <button type="submit" style={{ padding: '10px 20px' }}>Submit Report</button>
    </form>
  );
}