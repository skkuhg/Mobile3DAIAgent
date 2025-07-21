import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

export interface VoiceServiceInterface {
  startListening(): Promise<string>;
  speak(text: string): Promise<void>;
  stopListening(): Promise<void>;
  isSpeaking(): boolean;
  isListening(): boolean;
}

export class VoiceService implements VoiceServiceInterface {
  private recording: Audio.Recording | null = null;
  private isCurrentlySpeaking = false;
  private isCurrentlyListening = false;

  constructor() {
    this.initializeAudio();
  }

  private async initializeAudio(): Promise<void> {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async startListening(): Promise<string> {
    try {
      if (this.isCurrentlyListening) {
        throw new Error('Already listening');
      }

      this.isCurrentlyListening = true;

      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Audio recording permission not granted');
      }

      // Create recording
      this.recording = new Audio.Recording();
      const recordingOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;
      
      await this.recording.prepareToRecordAsync(recordingOptions);
      await this.recording.startAsync();

      console.log('Started recording...');

      // For demo purposes, we'll simulate speech-to-text after 3 seconds
      // In a real implementation, you would use a speech-to-text service
      return new Promise((resolve) => {
        setTimeout(async () => {
          const result = await this.stopListening();
          resolve('Hello, this is a demo transcription. Please integrate with a real STT service.');
        }, 3000);
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      this.isCurrentlyListening = false;
      throw error;
    }
  }

  async stopListening(): Promise<string> {
    try {
      if (!this.recording || !this.isCurrentlyListening) {
        return '';
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isCurrentlyListening = false;

      console.log('Stopped recording, audio saved to:', uri);

      // Here you would normally send the audio to a speech-to-text service
      // For now, returning a placeholder
      return 'Speech-to-text result would go here';

    } catch (error) {
      console.error('Error stopping recording:', error);
      this.isCurrentlyListening = false;
      return '';
    }
  }

  async speak(text: string): Promise<void> {
    try {
      if (this.isCurrentlySpeaking) {
        await Speech.stop();
      }

      this.isCurrentlySpeaking = true;

      const options: Speech.SpeechOptions = {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.8,
        voice: undefined, // Use default voice
        onStart: () => {
          console.log('Started speaking');
        },
        onDone: () => {
          this.isCurrentlySpeaking = false;
          console.log('Finished speaking');
        },
        onStopped: () => {
          this.isCurrentlySpeaking = false;
          console.log('Speech stopped');
        },
        onError: (error) => {
          this.isCurrentlySpeaking = false;
          console.error('Speech error:', error);
        }
      };

      await Speech.speak(text, options);

    } catch (error) {
      console.error('Error in text-to-speech:', error);
      this.isCurrentlySpeaking = false;
      throw error;
    }
  }

  isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  isListening(): boolean {
    return this.isCurrentlyListening;
  }

  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }

  async stopSpeaking(): Promise<void> {
    try {
      if (this.isCurrentlySpeaking) {
        await Speech.stop();
        this.isCurrentlySpeaking = false;
      }
    } catch (error) {
      console.error('Error stopping speech:', error);
    }
  }

  async cleanup(): Promise<void> {
    try {
      await this.stopListening();
      await this.stopSpeaking();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}