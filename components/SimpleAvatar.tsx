import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface SimpleAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
}

export default function SimpleAvatar({ isListening, isSpeaking, isThinking }: SimpleAvatarProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isListening) {
      // Pulsing animation for listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (isSpeaking) {
      // Gentle rotation for speaking
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else if (isThinking) {
      // Scale animation for thinking
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animations
      pulseAnim.setValue(1);
      scaleAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [isListening, isSpeaking, isThinking]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getAvatarColor = () => {
    if (isListening) return '#28a745'; // Green for listening
    if (isSpeaking) return '#007bff'; // Blue for speaking
    if (isThinking) return '#ffc107'; // Yellow for thinking
    return '#6c757d'; // Gray for idle
  };

  const getAvatarEmoji = () => {
    if (isListening) return '👂';
    if (isSpeaking) return '💬';
    if (isThinking) return '🤔';
    return '🤖';
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.avatar,
          {
            backgroundColor: getAvatarColor(),
            transform: [
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
              { rotate: spin },
            ],
          },
        ]}
      >
        <Animated.Text style={styles.avatarEmoji}>
          {getAvatarEmoji()}
        </Animated.Text>
      </Animated.View>
      
      {/* Outer ring for listening state */}
      {isListening && (
        <Animated.View
          style={[
            styles.outerRing,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}
      
      {/* Thinking dots */}
      {isThinking && (
        <View style={styles.thinkingDots}>
          <Animated.View style={[styles.dot, { opacity: scaleAnim }]} />
          <Animated.View style={[styles.dot, { opacity: scaleAnim }]} />
          <Animated.View style={[styles.dot, { opacity: scaleAnim }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  avatarEmoji: {
    fontSize: 32,
    textAlign: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#28a745',
    opacity: 0.3,
  },
  thinkingDots: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffc107',
    marginHorizontal: 2,
  },
});