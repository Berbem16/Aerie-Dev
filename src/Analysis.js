import React, { useState, useRef, useEffect } from 'react';
import { FaBrain, FaRobot, FaPaperPlane, FaPlus, FaTrash, FaComments } from 'react-icons/fa';
import './App.css';

const Analysis = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const messagesEndRef = useRef(null);

  const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  const USER_NAME = 'default_user'; // Can be changed to actual user name when auth is implemented

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat sessions on mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await fetch(`${API_URL}/chat/sessions?user_name=${USER_NAME}`);
      if (response.ok) {
        const sessions = await response.json();
        setChatSessions(sessions);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch(`${API_URL}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: USER_NAME,
          title: null
        })
      });

      if (response.ok) {
        const newSession = await response.json();
        await loadChatSessions();
        setCurrentSessionId(newSession.id);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  const loadSession = async (sessionId) => {
    try {
      console.log(`Loading session ${sessionId}`);
      const response = await fetch(`${API_URL}/chat/sessions/${sessionId}`);
      if (response.ok) {
        const session = await response.json();
        console.log(`Loaded session ${sessionId} with ${session.messages?.length || 0} messages`);
        setCurrentSessionId(sessionId);
        // Convert database messages to UI format
        const formattedMessages = session.messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content
        }));
        setMessages(formattedMessages);
      } else {
        console.error(`Failed to load session ${sessionId}: ${response.status}`);
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat session?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadChatSessions();
        if (currentSessionId === sessionId) {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const saveMessage = async (sessionId, role, content) => {
    if (!sessionId || !content) {
      console.error('Cannot save message: missing sessionId or content', { sessionId, role, contentLength: content?.length });
      return;
    }

    try {
      console.log(`Saving ${role} message to session ${sessionId}, content length: ${content.length}`);
      const response = await fetch(`${API_URL}/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: role,
          content: content
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to save message: ${response.status}`, errorText);
        throw new Error(`Failed to save message: ${response.status} ${errorText}`);
      }

      const savedMessage = await response.json();
      console.log(`Successfully saved ${role} message with ID: ${savedMessage.id}`);

      // Reload sessions to update titles and message counts
      await loadChatSessions();
    } catch (error) {
      console.error('Error saving message:', error);
      // Don't throw - we don't want to break the UI if save fails
    }
  };

  const sendMessage = async () => {
    // Only send if there's a message and we're not already loading
    if (!inputMessage.trim() || isLoading) return;

    let sessionId = currentSessionId;

    // Create new session if none exists
    if (!sessionId) {
      try {
        const response = await fetch(`${API_URL}/chat/sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_name: USER_NAME,
            title: null
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create session');
        }

        const newSession = await response.json();
        sessionId = newSession.id;
        setCurrentSessionId(sessionId);
        await loadChatSessions();
      } catch (error) {
        console.error('Error creating new session:', error);
        alert('Failed to create chat session. Please try again.');
        return; // Don't proceed if session creation fails
      }
    }

    const messageToSend = inputMessage.trim();
    
    const userMessage = {
      role: 'user',
      content: messageToSend
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Save user message to database
    await saveMessage(sessionId, 'user', messageToSend);

    try {
      // Prepare messages for LLM (convert to format expected by API)
      const messagesForAPI = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      messagesForAPI.push(userMessage);

      const response = await fetch(`${API_URL}/llm/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messagesForAPI,
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
                  if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content = assistantContent;
                  } else {
                    updated.push({ role: 'assistant', content: assistantContent });
                  }
                  return updated;
                });
              }
              if (parsed.done) break;
              if (parsed.error) {
                const errorMessage = {
                  role: 'assistant',
                  content: parsed.error
                };
                setMessages(prev => [...prev, errorMessage]);
                // Try to save error message too
                if (sessionId) {
                  await saveMessage(sessionId, 'assistant', parsed.error);
                }
                return;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // Ensure final state
      setMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1] && updated[updated.length - 1].role === 'assistant') {
          updated[updated.length - 1].content = assistantContent;
        } else {
          updated.push({ role: 'assistant', content: assistantContent });
        }
        return updated;
      });

      // Save assistant response to database (use sessionId from closure)
      if (sessionId && assistantContent && assistantContent.trim().length > 0) {
        await saveMessage(sessionId, 'assistant', assistantContent);
      } else if (sessionId && !assistantContent) {
        console.warn('Assistant response was empty, not saving');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = error.message || 'Sorry, I encountered an error. Please try again.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMsg
      }]);
      // Save error message to database
      if (sessionId) {
        await saveMessage(sessionId, 'assistant', errorMsg);
      }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="analysis-page">
      <main className="App-main">
        <div className="analysis-container" style={{ display: 'flex', flexDirection: 'row', height: '100%', gap: '1rem' }}>
          {/* Main Chat Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="analysis-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div className="analysis-icon">
                <FaBrain />
              </div>
              <div style={{ flex: 1 }}>
                <h1>AI-Powered Analysis</h1>
                <p className="analysis-subtitle">
                  Advanced LLM-driven insights and intelligence for UAS sightings
                </p>
              </div>
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
                {messages.length === 0 && !currentSessionId ? (
                  <div style={{ 
                    textAlign: 'center', 
                    color: '#888', 
                    padding: '2rem',
                    fontStyle: 'italic'
                  }}>
                    Start a new conversation by selecting a chat session or creating a new one.
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={message.id || index} style={{
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
                  ))
                )}
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

          {/* Right Sidebar - Chat Sessions */}
          <div style={{
            width: '300px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '1px solid #333',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFFF00' }}>
                <FaComments />
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Chat Sessions</h3>
              </div>
              <button
                onClick={createNewSession}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#FFFF00',
                  color: '#000',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="New Chat"
              >
                <FaPlus />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loadingSessions ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>Loading...</div>
              ) : chatSessions.length === 0 ? (
                <div style={{ color: '#888', textAlign: 'center', padding: '1rem' }}>
                  No chat sessions yet. Create one to get started!
                </div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => loadSession(session.id)}
                    style={{
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      backgroundColor: currentSessionId === session.id ? '#2d2d2d' : '#222',
                      border: currentSessionId === session.id ? '1px solid #FFFF00' : '1px solid #333',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.5rem'
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          color: '#FFFF00',
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          marginBottom: '0.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {session.title || 'New Chat'}
                        </div>
                        <div style={{
                          color: '#888',
                          fontSize: '0.75rem',
                          marginBottom: '0.25rem'
                        }}>
                          {session.message_count} message{session.message_count !== 1 ? 's' : ''}
                        </div>
                        <div style={{
                          color: '#666',
                          fontSize: '0.7rem'
                        }}>
                          {formatDate(session.updated_at || session.created_at)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteSession(session.id, e)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          color: '#888',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#ff4444'}
                        onMouseLeave={(e) => e.target.style.color = '#888'}
                        title="Delete session"
                      >
                        <FaTrash style={{ fontSize: '0.75rem' }} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
