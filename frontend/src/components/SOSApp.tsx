import React, { useState } from 'react';
import { addIncident } from '../services/incidentService';

export const SOSApp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleSendSOS = () => {
    setLoading(true);
    setStatusText('Acquiring location...');

    const createSOSIncident = (lat: number, lng: number, locationName: string) => {
      try {
        addIncident({
          title: '🚨 EMERGENCY: SOS Distress Signal Triggered',
          description: 'User initiated an immediate SOS panic broadcast from mobile interface.',
          location: locationName,
          lat: lat,
          lng: lng,
        });
        window.dispatchEvent(new Event('storage'));
        setLoading(false);
        setStatusText('SUCCESS: SOS Broadcast Sent! Check Incident Feed.');
      } catch (err) {
        console.error("Error saving incident:", err);
        setLoading(false);
        setStatusText('Error saving to storage.');
      }
    };

    if (!navigator.geolocation) {
      createSOSIncident(28.6139, 77.2090, 'Default Fallback Location (GPS Unavailable)');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        createSOSIncident(latitude, longitude, `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        createSOSIncident(28.6139, 77.2090, 'Fallback Location (GPS Permission Denied)');
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-center">
      <h2 className="text-2xl font-black text-red-500 tracking-wider mb-2">EMERGENCY SOS</h2>
      <p className="text-slate-400 text-sm mb-6">
        Pressing the button below instantly transmits your coordinates and registers an emergency alert.
      </p>

      <button
        onClick={handleSendSOS}
        disabled={loading}
        className="w-full py-5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white font-bold text-lg rounded-xl shadow-lg shadow-red-900/40 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Processing SOS...' : 'SEND SOS DISTRESS SIGNAL'}
      </button>

      {statusText && (
        <div className="mt-4 p-3 bg-slate-950 border border-slate-800 text-indigo-300 text-xs rounded-lg font-mono">
          {statusText}
        </div>
      )}
    </div>
  );
};