// useEventSettings — Socket.IO real-time + fallback polling
import { useState, useEffect, useCallback } from 'react';
import { settingsAPI } from '../services/api';
import { socket } from '../services/socket';

export function useEventSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await settingsAPI.get();
      setSettings(res.data.data);
      setError(null);
    } catch (err) {
      if (loading) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchSettings();

    const handleSettingsUpdate = (updatedSettings) => {
      if (updatedSettings) {
        setSettings(updatedSettings);
      } else {
        fetchSettings();
      }
    };

    socket.on('settings:updated', handleSettingsUpdate);
    socket.on('event:reset', fetchSettings);

    const interval = setInterval(fetchSettings, 10000);

    return () => {
      socket.off('settings:updated', handleSettingsUpdate);
      socket.off('event:reset', fetchSettings);
      clearInterval(interval);
    };
  }, [fetchSettings]);

  const updateSettings = useCallback(async (newSettings) => {
    const res = await settingsAPI.update(newSettings);
    setSettings(res.data.data);
    return res.data;
  }, []);

  const resetEvent = useCallback(async () => {
    const res = await settingsAPI.reset();
    return res.data;
  }, []);

  return { settings, loading, error, updateSettings, resetEvent, refetch: fetchSettings };
}
