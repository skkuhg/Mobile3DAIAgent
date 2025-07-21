# Mobile 3D AI Agent with RAG

A React Native mobile application featuring a 3D AI agent that uses Retrieval-Augmented Generation (RAG) to provide intelligent responses. The agent searches for relevant information using Tavily AI and generates responses using OpenAI's API.

## Features

- 🤖 Interactive 3D AI agent with emotional expressions
- 🎙️ Voice input and speech synthesis
- 🔍 Real-time web search integration via Tavily AI
- 💬 Chat interface with message history
- 🎨 Animated 3D character with context-aware reactions
- 📱 Cross-platform mobile support (iOS & Android)

## Prerequisites

- Node.js 18+
- Expo CLI
- OpenAI API key
- Tavily AI API key
- Expo Go app for testing

## Installation

1. Clone and navigate to the project:
```bash
cd Mobile3DAIAgent
```

2. Install dependencies:
```bash
npm install
```

3. Set up your API keys:
   - Copy `.env.example` to `.env`
   - Add your actual OpenAI API key
   - Add your actual Tavily AI API key

4. Start the development server:
```bash
npm start
```

5. Open Expo Go app and scan the QR code

## Project Structure

```
Mobile3DAIAgent/
├── components/
│   ├── Agent3D.tsx          # 3D agent with animations
│   ├── ChatInterface.tsx    # Chat UI component
│   └── VoiceControls.tsx    # Voice input controls
├── services/
│   ├── RAGService.ts        # OpenAI + Tavily integration
│   └── VoiceService.ts      # Speech-to-text & text-to-speech
├── App.tsx                  # Main application component
├── .env                     # Environment variables
└── package.json             # Dependencies and scripts
```

## Key Components

### 3D Agent (Agent3D.tsx)
- Animated 3D character built with Three.js and expo-gl
- Emotional states: idle, thinking, speaking, happy, confused
- Real-time animations based on AI interaction state
- Breathing, gestures, and facial expressions

### RAG Service (RAGService.ts)
- Integrates OpenAI GPT-4 with Tavily search
- Searches web for relevant information
- Generates contextual responses using retrieved data
- Error handling and fallback responses

### Voice Service (VoiceService.ts)
- Speech-to-text input capability
- Text-to-speech response synthesis
- Audio recording and playback management
- Cross-platform audio handling

### Chat Interface (ChatInterface.tsx)
- Message history display
- Real-time typing indicators
- User-friendly input controls
- Responsive mobile design

## Usage

1. **Text Chat**: Type messages in the chat interface
2. **Voice Input**: Tap the microphone button to speak
3. **3D Agent**: Watch the agent react with appropriate emotions
4. **RAG Responses**: Get AI responses enhanced with real-time web search

## API Integration

### OpenAI
- Model: GPT-4
- Features: Chat completions, streaming responses
- Context: Enhanced with web search results

### Tavily AI
- Real-time web search
- Content filtering and ranking
- Source attribution in responses

## Development Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
npm run web        # Run in web browser
```

## Known Limitations

1. **Speech-to-Text**: Currently using placeholder implementation
   - Integrate with services like Google Speech-to-Text or Azure Speech Services

2. **3D Models**: Basic geometric shapes
   - Replace with detailed GLTF models for better visual appeal

3. **Network Dependency**: Requires internet for AI features
   - Consider offline fallback responses

## Future Enhancements

- Custom 3D character models (GLTF/FBX)
- Real speech-to-text integration
- Multiple language support
- Personality customization
- Conversation memory
- AR integration
- Custom wake words

## Troubleshooting

### Common Issues

1. **App won't start**: Check Node.js version (18+ required)
2. **API errors**: Verify API keys in .env file
3. **3D rendering issues**: Ensure device supports WebGL
4. **Voice permissions**: Allow microphone access when prompted

### Performance Tips

- Close other apps when testing 3D features
- Use physical device for better 3D performance
- Check network connection for AI responses

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with proper testing
4. Submit pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check troubleshooting section
- Review console logs in Expo Go
- Test on different devices
- Verify API connectivity

---

Built with ❤️ using React Native, Expo, Three.js, OpenAI, and Tavily AI