import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import API_URL from '../config/api';
import { getChatHistory, saveChatHistory, clearChatHistory } from '../utils/storage';

const AnalysisScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await getChatHistory();
      if (history.length > 0) {
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    // Save to storage
    await saveChatHistory(newMessages);

    try {
      const response = await fetch(`${API_URL}/llm/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          model: 'gpt-oss-120b',
          temperature: 0.7,
          top_p: 0.8,
          max_completion_tokens: 20000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMessage.content += data.content;
                // Update the last message in real-time
                const lastIndex = updatedMessages.length - 1;
                if (updatedMessages[lastIndex]?.role === 'assistant') {
                  updatedMessages[lastIndex] = { ...assistantMessage };
                } else {
                  updatedMessages.push({ ...assistantMessage });
                }
                setMessages([...updatedMessages]);
              }
              if (data.done) {
                break;
              }
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }

      // Final save
      await saveChatHistory(updatedMessages);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
      };
      const errorMessages = [...newMessages, errorMessage];
      setMessages(errorMessages);
      await saveChatHistory(errorMessages);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Chat',
      'Are you sure you want to clear all chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearChatHistory();
            setMessages([]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="chat-bubble-outline" size={64} color="#ffd700" />
            <Text style={styles.emptyStateText}>
              Start a conversation with the AI assistant
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Ask questions about UAS sightings, patterns, and threats
            </Text>
          </View>
        ) : (
          messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <Text style={styles.messageRole}>
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </Text>
              <Text style={styles.messageText}>{message.content}</Text>
            </View>
          ))
        )}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#ffd700" />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#999999"
          multiline
          editable={!isLoading}
        />
        <View style={styles.inputButtons}>
          {messages.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearChat}>
              <Icon name="delete-outline" size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Icon name="send" size={20} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    color: '#cccccc',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  messageContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    maxWidth: '85%',
  },
  userMessage: {
    backgroundColor: '#2d2d2d',
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#404040',
  },
  assistantMessage: {
    backgroundColor: '#404040',
    alignSelf: 'flex-start',
  },
  messageRole: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  messageText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 10,
  },
  loadingText: {
    color: '#ffd700',
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: '#2d2d2d',
    borderTopWidth: 1,
    borderTopColor: '#404040',
    padding: 15,
  },
  input: {
    backgroundColor: '#404040',
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 4,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
    maxHeight: 100,
    marginBottom: 10,
  },
  inputButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  clearButton: {
    backgroundColor: '#666666',
    padding: 10,
    borderRadius: 4,
  },
  sendButton: {
    backgroundColor: '#ffd700',
    padding: 10,
    borderRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#666666',
    opacity: 0.5,
  },
});

export default AnalysisScreen;

