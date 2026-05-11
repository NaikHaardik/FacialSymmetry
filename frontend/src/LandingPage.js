import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { OrbitControls } from "@react-three/drei";

function RotatingRing() {
  const mesh = useRef();
  useFrame(() => { mesh.current.rotation.y += 0.008; });
  return (
    <mesh ref={mesh}>
      <torusGeometry args={[1.5, 0.4, 16, 100]} />
      <meshStandardMaterial color="#00d4ff" wireframe />
    </mesh>
  );
}

export default function LandingPage({ onEnter }) {
  return (
    <div style={{
      height: "100vh",
      background: "#0a0a1a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontFamily: "sans-serif"
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
        🦷 FaceSymmetry AI
      </h1>
      <p style={{ color: "#aaa", marginBottom: "1rem", textAlign: "center", maxWidth: "500px" }}>
        AI-powered facial symmetry analysis for dental and orthodontic evaluation
      </p>
      <div style={{ width: "100%", height: "300px" }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <RotatingRing />
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>
      <button
        onClick={onEnter}
        style={{
          marginTop: "2rem",
          padding: "1rem 2.5rem",
          fontSize: "1.1rem",
          background: "#00d4ff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          color: "#000",
          fontWeight: "bold"
        }}
      >
        Enter Application →
      </button>
    </div>
  );
}