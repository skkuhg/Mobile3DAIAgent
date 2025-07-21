import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, TextureLoader } from 'expo-three';
import {
  PerspectiveCamera,
  Scene,
  AmbientLight,
  DirectionalLight,
  SphereGeometry,
  MeshPhongMaterial,
  Mesh,
  Group,
  BoxGeometry,
  Vector3,
  MathUtils
} from 'three';

interface Agent3DProps {
  isListening: boolean;
  isSpeaking: boolean;
  currentEmotion: 'idle' | 'thinking' | 'speaking' | 'happy' | 'confused';
}

export default function Agent3D({ isListening, isSpeaking, currentEmotion }: Agent3DProps) {
  const [gl, setGL] = useState<any>(null);
  const [renderer, setRenderer] = useState<Renderer | null>(null);
  const [scene, setScene] = useState<Scene | null>(null);
  const [camera, setCamera] = useState<PerspectiveCamera | null>(null);
  const [agentGroup, setAgentGroup] = useState<Group | null>(null);
  
  const animationTime = useRef(0);
  const animationId = useRef<number>();

  const onContextCreate = async (gl: any) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    
    // Initialize renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    
    // Initialize scene
    const scene = new Scene();
    
    // Initialize camera
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    // Add lighting
    const ambientLight = new AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);
    
    // Create 3D agent
    const agentGroup = createAgent();
    scene.add(agentGroup);
    
    setGL(gl);
    setRenderer(renderer);
    setScene(scene);
    setCamera(camera);
    setAgentGroup(agentGroup);
    
    // Start animation loop
    startAnimationLoop(renderer, scene, camera, agentGroup);
  };

  const createAgent = (): Group => {
    const group = new Group();
    
    // Head
    const headGeometry = new SphereGeometry(0.8, 32, 16);
    const headMaterial = new MeshPhongMaterial({ 
      color: 0x87CEEB,
      shininess: 100
    });
    const head = new Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    group.add(head);
    
    // Eyes
    const eyeGeometry = new SphereGeometry(0.1, 8, 8);
    const eyeMaterial = new MeshPhongMaterial({ color: 0x000000 });
    
    const leftEye = new Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 1.7, 0.6);
    head.add(leftEye);
    
    const rightEye = new Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 1.7, 0.6);
    head.add(rightEye);
    
    // Mouth
    const mouthGeometry = new SphereGeometry(0.2, 8, 8);
    const mouthMaterial = new MeshPhongMaterial({ color: 0x000000 });
    const mouth = new Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 1.3, 0.6);
    mouth.scale.set(1, 0.3, 0.5);
    head.add(mouth);
    
    // Body
    const bodyGeometry = new BoxGeometry(1, 1.5, 0.5);
    const bodyMaterial = new MeshPhongMaterial({ color: 0x4682B4 });
    const body = new Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0;
    group.add(body);
    
    // Arms
    const armGeometry = new BoxGeometry(0.3, 1, 0.3);
    const armMaterial = new MeshPhongMaterial({ color: 0x87CEEB });
    
    const leftArm = new Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.8, 0.2, 0);
    group.add(leftArm);
    
    const rightArm = new Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.8, 0.2, 0);
    group.add(rightArm);
    
    // Store references for animation
    (group as any).head = head;
    (group as any).leftEye = leftEye;
    (group as any).rightEye = rightEye;
    (group as any).mouth = mouth;
    (group as any).leftArm = leftArm;
    (group as any).rightArm = rightArm;
    
    return group;
  };

  const startAnimationLoop = (
    renderer: Renderer,
    scene: Scene,
    camera: PerspectiveCamera,
    agentGroup: Group
  ) => {
    const animate = () => {
      animationTime.current += 0.016; // ~60fps
      
      if (agentGroup) {
        updateAgentAnimation(agentGroup);
      }
      
      renderer.render(scene, camera);
      gl.endFrameEXP();
      
      animationId.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const updateAgentAnimation = (agentGroup: Group) => {
    const head = (agentGroup as any).head;
    const leftEye = (agentGroup as any).leftEye;
    const rightEye = (agentGroup as any).rightEye;
    const mouth = (agentGroup as any).mouth;
    const leftArm = (agentGroup as any).leftArm;
    const rightArm = (agentGroup as any).rightArm;

    // Base floating animation
    const floatOffset = Math.sin(animationTime.current * 2) * 0.1;
    agentGroup.position.y = floatOffset;

    // Emotion-based animations
    switch (currentEmotion) {
      case 'idle':
        // Gentle breathing
        const breathScale = 1 + Math.sin(animationTime.current * 3) * 0.02;
        agentGroup.scale.set(breathScale, breathScale, breathScale);
        
        // Subtle head movement
        head.rotation.y = Math.sin(animationTime.current * 1.5) * 0.1;
        break;

      case 'thinking':
        // Hand to chin gesture
        rightArm.rotation.z = -Math.PI / 4;
        rightArm.position.x = 0.6;
        rightArm.position.y = 0.8;
        
        // Head tilt
        head.rotation.z = 0.2;
        head.rotation.x = -0.1;
        
        // Eyes looking up
        leftEye.position.y = 1.8;
        rightEye.position.y = 1.8;
        break;

      case 'speaking':
        // Mouth animation
        const mouthScale = 1 + Math.sin(animationTime.current * 8) * 0.3;
        mouth.scale.y = mouthScale * 0.3;
        
        // Head bobbing
        head.rotation.y = Math.sin(animationTime.current * 4) * 0.05;
        
        // Arm gestures
        leftArm.rotation.z = Math.sin(animationTime.current * 3) * 0.3;
        rightArm.rotation.z = -Math.sin(animationTime.current * 3 + Math.PI) * 0.3;
        break;

      case 'happy':
        // Bouncing
        const bounceScale = 1 + Math.abs(Math.sin(animationTime.current * 4)) * 0.1;
        agentGroup.scale.set(bounceScale, bounceScale, bounceScale);
        
        // Wide smile
        mouth.scale.x = 1.5;
        mouth.position.y = 1.4;
        
        // Raised arms
        leftArm.rotation.z = Math.PI / 3;
        rightArm.rotation.z = -Math.PI / 3;
        break;

      case 'confused':
        // Head scratching
        rightArm.rotation.z = -Math.PI / 2;
        rightArm.position.y = 1.5;
        
        // Head tilt
        head.rotation.z = Math.sin(animationTime.current * 2) * 0.2;
        
        // Confused expression
        leftEye.scale.set(0.8, 0.8, 0.8);
        rightEye.scale.set(1.2, 1.2, 1.2);
        break;
    }

    // Listening indicator
    if (isListening) {
      const pulseScale = 1 + Math.sin(animationTime.current * 6) * 0.1;
      leftEye.scale.set(pulseScale, pulseScale, pulseScale);
      rightEye.scale.set(pulseScale, pulseScale, pulseScale);
    }
  };

  useEffect(() => {
    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  // Reset animations when emotion changes
  useEffect(() => {
    if (agentGroup) {
      const head = (agentGroup as any).head;
      const leftEye = (agentGroup as any).leftEye;
      const rightEye = (agentGroup as any).rightEye;
      const mouth = (agentGroup as any).mouth;
      const leftArm = (agentGroup as any).leftArm;
      const rightArm = (agentGroup as any).rightArm;

      // Reset positions and rotations
      head.rotation.set(0, 0, 0);
      leftEye.position.set(-0.3, 1.7, 0.6);
      rightEye.position.set(0.3, 1.7, 0.6);
      leftEye.scale.set(1, 1, 1);
      rightEye.scale.set(1, 1, 1);
      mouth.position.set(0, 1.3, 0.6);
      mouth.scale.set(1, 0.3, 0.5);
      leftArm.position.set(-0.8, 0.2, 0);
      rightArm.position.set(0.8, 0.2, 0);
      leftArm.rotation.set(0, 0, 0);
      rightArm.rotation.set(0, 0, 0);
    }
  }, [currentEmotion, agentGroup]);

  return (
    <View style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
});