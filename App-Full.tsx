import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import Agent3D from './components/Agent3D';
import ChatInterface, { Message } from './components/ChatInterface';
import VoiceControls from './components/VoiceControls';
import { RAGService } from './services/RAGService';
import { VoiceService } from './services/VoiceService';

type AgentEmotion = 'idle' | 'thinking' | 'speaking' | 'happy' | 'confused';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentEmotion, setAgentEmotion] = useState<AgentEmotion>('idle');
  
  // Services
  const [ragService, setRagService] = useState<RAGService | null>(null);
  const [voiceService, setVoiceService] = useState<VoiceService | null>(null);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize RAG Service
        const openaiKey = process.env.OPENAI_API_KEY || 'your_openai_api_key_here';
        const tavilyKey = process.env.TAVILY_API_KEY || 'your_tavily_api_key_here';
        
        const rag = new RAGService(openaiKey, tavilyKey);
        setRagService(rag);

        // Initialize Voice Service
        const voice = new VoiceService();
        setVoiceService(voice);

        console.log('Services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize services:', error);
        Alert.alert(
          'Initialization Error',
          'Failed to initialize AI services. Some features may not work properly.',
          [{ text: 'OK' }]
        );
      }
    };

    initializeServices();
  }, []);

  const generateMessageId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addMessage = useCallback((text: string, isUser: boolean): Message => {
    const message: Message = {
      id: generateMessageId(),
      text,
      isUser,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const handleUserQuery = async (query: string) => {
    if (!ragService) {
      Alert.alert('Error', 'AI service not available. Please restart the app.');
      return;
    }

    // Add user message
    addMessage(query, true);
    
    // Set processing state
    setIsProcessing(true);
    setAgentEmotion('thinking');

    try {
      // Process query with RAG
      const response = await ragService.processQuery(query);
      
      // Add AI response
      addMessage(response, false);
      
      // Speak the response if voice service is available
      if (voiceService) {
        setAgentEmotion('speaking');
        setIsSpeaking(true);
        
        try {
          await voiceService.speak(response);
        } catch (voiceError) {
          console.warn('Voice synthesis failed:', voiceError);
        } finally {
          setIsSpeaking(false);
        }
      }
      
      // Return to happy state briefly, then idle
      setAgentEmotion('happy');
      setTimeout(() => setAgentEmotion('idle'), 2000);
      
    } catch (error) {
      console.error('Error processing query:', error);
      
      setAgentEmotion('confused');
      addMessage(
        'I apologize, but I encountered an error processing your request. Please try again.',
        false
      );
      
      setTimeout(() => setAgentEmotion('idle'), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartListening = async () => {
    if (!voiceService) {
      Alert.alert('Error', 'Voice service not available.');
      return;
    }

    try {
      setIsListening(true);
      setAgentEmotion('idle');
      
      const transcription = await voiceService.startListening();
      
      if (transcription.trim()) {
        await handleUserQuery(transcription);
      }
    } catch (error) {
      console.error('Voice input error:', error);
      Alert.alert(
        'Voice Input Error',
        'Failed to process voice input. Please try again or use text input.',
        [{ text: 'OK' }]
      );
      setAgentEmotion('confused');
      setTimeout(() => setAgentEmotion('idle'), 2000);
    } finally {
      setIsListening(false);
    }
  };

  const handleStopListening = async () => {
    if (!voiceService) return;
    
    try {
      await voiceService.stopListening();
    } catch (error) {
      console.error('Error stopping voice input:', error);
    } finally {
      setIsListening(false);
    }
  };

  const handleVoiceInput = (text: string) => {
    if (text.trim()) {
      handleUserQuery(text);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceService) {
        voiceService.cleanup();
      }
    };
  }, [voiceService]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} 
        backgroundColor="#000"
      />
      
      <View style={styles.content}>
        {/* 3D Agent Scene */}
        <View style={styles.agentContainer}>
          <Agent3D 
            isListening={isListening}
            isSpeaking={isSpeaking}
            currentEmotion={agentEmotion}
          />
        </View>
        
        {/* Chat Interface */}
        <View style={styles.chatContainer}>
          <ChatInterface 
            messages={messages}
            onSendMessage={handleUserQuery}
            isProcessing={isProcessing}
          />
        </View>
        
        {/* Voice Controls */}
        <VoiceControls 
          onVoiceInput={handleVoiceInput}
          isListening={isListening}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  agentContainer: {
    height: 300,
    backgroundColor: '#000000',
  },
  chatContainer: {
    flex: 1,
  },
});