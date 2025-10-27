import React, { useState, useRef, useEffect } from 'react';
import { FaBrain, FaChartLine, FaLightbulb, FaRobot, FaPaperPlane, FaTrash } from 'react-icons/fa';
import './App.css';

const CHAT_STORAGE_KEY = 'aerie_ai_chat_history';

const getInitialMessages = () => {
  const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
  if (savedMessages) {
    try {
      return JSON.parse(savedMessages);
    } catch (e) {
      console.error('Error loading chat history:', e);
    }
  }
  return [
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant for UAS sighting analysis. I can help you analyze patterns, provide insights, and answer questions about unmanned aerial system sightings. How can I assist you today?'
    }
  ];
};

const Analysis = () => {
  const [messages, setMessages] = useState(getInitialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const clearConversation = () => {
    if (window.confirm('Are you sure you want to clear the entire conversation history?')) {
      const defaultMessage = [
        {
          role: 'assistant',
          content: 'Hello! I\'m your AI assistant for UAS sighting analysis. I can help you analyze patterns, provide insights, and answer questions about unmanned aerial system sightings. How can I assist you today?'
        }
      ];
      setMessages(defaultMessage);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(defaultMessage));
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/llm/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: 'qwen-3-235b-a22b-instruct-2507',
          temperature: 0.7,
          top_p: 0.8,
          max_completion_tokens: 20000
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;
                setMessages(prev => {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (lastMsg.role === 'assistant') {
                    lastMsg.content = assistantContent;
                  } else {
                    updated.push({ role: 'assistant', content: assistantContent });
                  }
                  return updated;
                });
              }
              if (parsed.done) break;
              if (parsed.error) throw new Error(parsed.error);
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // Ensure final state
      setMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1].role === 'assistant') {
          updated[updated.length - 1].content = assistantContent;
        } else {
          updated.push({ role: 'assistant', content: assistantContent });
        }
        return updated;
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="analysis-page">
      <main className="App-main">
        <div className="analysis-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="analysis-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="analysis-icon">
                <FaBrain />
              </div>
              <div>
                <h1>AI-Powered Analysis</h1>
                <p className="analysis-subtitle">
                  Advanced LLM-driven insights and intelligence for UAS sightings
                </p>
              </div>
            </div>
            {messages.length > 1 && (
              <button
                onClick={clearConversation}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 'bold'
                }}
                title="Clear conversation history"
              >
                <FaTrash /> Clear Chat
              </button>
            )}
          </div>

          <div className="analysis-content" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Chat Messages Area */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '1rem', 
              marginBottom: '1rem',
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              {messages.map((message, index) => (
                <div key={index} style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: message.role === 'user' ? '#2d2d2d' : '#333',
                  borderRadius: '8px',
                  border: message.role === 'user' ? '1px solid #FFFF00' : '1px solid #555'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: '#FFFF00',
                    fontSize: '0.875rem',
                    fontWeight: 'bold'
                  }}>
                    <FaRobot style={{ fontSize: '1rem' }} />
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div style={{ 
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    color: '#E0E0E0',
                    lineHeight: '1.6'
                  }}>
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem',
              padding: '1rem',
              backgroundColor: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #333'
            }}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about UAS sightings, patterns, threats, or any questions..."
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#2d2d2d',
                  color: '#E0E0E0',
                  border: '1px solid #555',
                  borderRadius: '6px',
                  resize: 'vertical',
                  minHeight: '60px',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem'
                }}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isLoading || !inputMessage.trim() ? '#555' : '#FFFF00',
                  color: isLoading || !inputMessage.trim() ? '#999' : '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '1.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <FaPaperPlane />
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
