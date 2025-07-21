import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';

interface VoiceControlsProps {
  onVoiceInput: (text: string) => void;
  isListening: boolean;
  onStartListening?: () => void;
  onStopListening?: () => void;
}

export default function VoiceControls({ 
  onVoiceInput, 
  isListening, 
  onStartListening, 
  onStopListening 
}: VoiceControlsProps) {
  const [pulseAnimation] = useState(new Animated.Value(1));

  React.useEffect(() => {
    if (isListening) {
      // Start pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation and reset
      pulseAnimation.stopAnimation();
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening, pulseAnimation]);

  const handleVoicePress = async () => {
    try {
      if (isListening) {
        // Stop listening
        if (onStopListening) {
          onStopListening();
        }
      } else {
        // Start listening
        if (onStartListening) {
          onStartListening();
        }
        
        // Simulate voice input for demo
        setTimeout(() => {
          onVoiceInput("This is a sample voice input. Please integrate with a real speech-to-text service.");
          if (onStopListening) {
            onStopListening();
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Voice control error:', error);
      Alert.alert(
        'Voice Input Error',
        'There was a problem with voice input. Please try again or use text input.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.voiceButton,
          { transform: [{ scale: pulseAnimation }] },
          isListening && styles.voiceButtonListening,
        ]}
      >
        <TouchableOpacity
          style={styles.voiceButtonTouchable}
          onPress={handleVoicePress}
          activeOpacity={0.7}
        >
          <View style={styles.micIcon}>
            <Text style={styles.micText}>🎤</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      <Text style={styles.instructionText}>
        {isListening ? 'Listening... Tap to stop' : 'Tap to speak'}
      </Text>
      
      {isListening && (
        <View style={styles.listeningIndicator}>
          <View style={styles.waveform}>
            {[...Array(5)].map((_, index) => (
              <WaveformBar key={index} delay={index * 100} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function WaveformBar({ delay }: { delay: number }) {
  const [scaleY] = useState(new Animated.Value(0.3));

  React.useEffect(() => {
    const animateBar = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleY, {
            toValue: 1,
            duration: 300 + Math.random() * 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleY, {
            toValue: 0.3,
            duration: 300 + Math.random() * 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const timeout = setTimeout(animateBar, delay);
    return () => clearTimeout(timeout);
  }, [delay, scaleY]);

  return (
    <Animated.View
      style={[
        styles.waveformBar,
        { transform: [{ scaleY }] },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  voiceButtonListening: {
    backgroundColor: '#FF3B30',
  },
  voiceButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
  },
  micIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  micText: {
    fontSize: 32,
  },
  instructionText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  listeningIndicator: {
    marginTop: 16,
    alignItems: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
  waveformBar: {
    width: 4,
    height: 20,
    backgroundColor: '#007AFF',
    marginHorizontal: 2,
    borderRadius: 2,
  },
});