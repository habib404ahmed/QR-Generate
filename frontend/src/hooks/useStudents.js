// useStudents — Socket.IO real-time + fallback polling
import { useState, useEffect, useCallback } from 'react';
import { studentsAPI } from '../services/api';
import { socket } from '../services/socket';

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await studentsAPI.getAll();
      setStudents(res.data.data.students || []);
      setError(null);
    } catch (err) {
      if (loading) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchStudents();

    // Socket.IO real-time listeners for immediate updates without refresh
    const handleLiveUpdate = () => {
      fetchStudents();
    };

    socket.on('student:registered', handleLiveUpdate);
    socket.on('student:updated', handleLiveUpdate);
    socket.on('student:deleted', handleLiveUpdate);
    socket.on('student:moved', handleLiveUpdate);
    socket.on('event:reset', handleLiveUpdate);

    // Fallback poll every 10s
    const interval = setInterval(fetchStudents, 10000);

    return () => {
      socket.off('student:registered', handleLiveUpdate);
      socket.off('student:updated', handleLiveUpdate);
      socket.off('student:deleted', handleLiveUpdate);
      socket.off('student:moved', handleLiveUpdate);
      socket.off('event:reset', handleLiveUpdate);
      clearInterval(interval);
    };
  }, [fetchStudents]);

  return { students, loading, error, refetch: fetchStudents };
}
