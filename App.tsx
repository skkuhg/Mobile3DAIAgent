import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { RAGService } from './services/RAGService';
import SimpleAvatar from './components/SimpleAvatar';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

export default function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: 'Hello! I am your AI Agent with real-time web search. Ask me anything!', 
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [ragService, setRagService] = useState<RAGService | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Initialize RAG Service
  useEffect(() => {
    const initializeRAG = async () => {
      try {
        const openaiKey = process.env.OPENAI_API_KEY || 'your_openai_api_key_here';
        const tavilyKey = process.env.TAVILY_API_KEY || 'your_tavily_api_key_here';
        
        const rag = new RAGService(openaiKey, tavilyKey);
        setRagService(rag);
        console.log('RAG Service initialized');
      } catch (error) {
        console.error('Failed to initialize RAG service:', error);
        Alert.alert('Setup Error', 'Failed to initialize AI services.');
      }
    };
    
    initializeRAG();
  }, []);

  const sendMessage = async () => {
    if (message.trim() && ragService && !isProcessing) {
      const userMessage: Message = {
        text: message.trim(),
        isUser: true,
        timestamp: new Date()
      };
      
      // Add user message
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsProcessing(true);
      Keyboard.dismiss();
      
      // Add loading message
      const loadingMessage: Message = {
        text: 'Thinking and searching...',
        isUser: false,
        timestamp: new Date(),
        isLoading: true
      };
      setMessages(prev => [...prev, loadingMessage]);
      
      try {
        // Get AI response with web search
        const aiResponse = await ragService.processQuery(userMessage.text);
        
        // Remove loading message and add real response
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => !msg.isLoading);
          return [...withoutLoading, {
            text: aiResponse,
            isUser: false,
            timestamp: new Date()
          }];
        });
      } catch (error) {
        console.error('AI processing error:', error);
        
        // Remove loading message and add error message
        setMessages(prev => {
          const withoutLoading = prev.filter(msg => !msg.isLoading);
          return [...withoutLoading, {
            text: 'Sorry, I encountered an error while processing your request. Please try again.',
            isUser: false,
            timestamp: new Date()
          }];
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      // TODO: Stop voice recording
      Alert.alert('Voice Input', 'Voice input stopped (feature coming soon)');
    } else {
      setIsListening(true);
      // TODO: Start voice recording
      Alert.alert('Voice Input', 'Voice input started (feature coming soon)');
      // Auto-stop after 5 seconds for demo
      setTimeout(() => setIsListening(false), 5000);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Agent with RAG</Text>
        <Text style={styles.subtitle}>
          {ragService ? '✅ Connected • Real-time web search' : '⏳ Initializing AI services...'}
        </Text>
      </View>

      {/* 3D Avatar Section */}
      <View style={styles.avatarSection}>
        <SimpleAvatar 
          isListening={isListening}
          isSpeaking={false}
          isThinking={isProcessing}
        />
        <Text style={styles.avatarStatus}>
          {isListening ? '🎙️ Listening...' :
           isProcessing ? '🤔 Thinking...' :
           '💬 Ready to chat'}
        </Text>
      </View>

      <ScrollView 
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.message,
              msg.isUser ? styles.userMessage : styles.aiMessage
            ]}
          >
            {msg.isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#007bff" />
                <Text style={styles.loadingText}>{msg.text}</Text>
              </View>
            ) : (
              <Text style={[
                styles.messageText,
                msg.isUser ? styles.userMessageText : styles.aiMessageText
              ]}>
                {msg.text}
              </Text>
            )}
            <Text style={[
              styles.timestampText,
              msg.isUser ? styles.userTimestamp : styles.aiTimestamp
            ]}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity 
          style={[
            styles.voiceButton,
            isListening && styles.voiceButtonActive
          ]}
          onPress={toggleVoiceInput}
          disabled={isProcessing || !ragService}
        >
          <Text style={[
            styles.voiceButtonText,
            isListening && styles.voiceButtonTextActive
          ]}>
            {isListening ? '🎙️' : '🎤'}
          </Text>
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Ask me anything..."
          multiline
          maxLength={500}
          editable={!isProcessing && !!ragService}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!message.trim() || isProcessing || !ragService) && styles.sendButtonDisabled
          ]} 
          onPress={sendMessage}
          disabled={!message.trim() || isProcessing || !ragService}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '500',
  },
  avatarSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  avatarStatus: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 8,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  message: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 16,
    maxWidth: '85%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#2c3e50',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6c757d',
    fontSize: 16,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  timestampText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '400',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#6c757d',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  voiceButton: {
    backgroundColor: '#28a745',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#dc3545',
    transform: [{ scale: 1.1 }],
  },
  voiceButtonText: {
    fontSize: 20,
  },
  voiceButtonTextActive: {
    fontSize: 22,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    backgroundColor: '#ffffff',
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});