import axios from 'axios';
import API_BASE from './api.js';

export const ChatAPI = {
  sendMessage: async (message) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.post(
        `${API_BASE}/api/chat`,
        { message },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error communicating with AI Chatbot:", error);
      throw error;
    }
  }
};