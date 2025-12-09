import { useState, useEffect, useRef } from "react";

export default function AboutMe() {
  const [showSecret, setShowSecret] = useState(false);
  const [fakeKey, setFakeKey] = useState("");
  const [eggPos, setEggPos] = useState({ x: 300, y: 300 });
  const [status, setStatus] = useState("");

  const posRef = useRef({ x: 300, y: 300 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const requestRef = useRef(null);

  const movementEnabled = useRef(true);
  const caughtRef = useRef(false);

  // Accessibility: detect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Movement settings
  const dangerRadius = 450;
  const easing = 0.22;
  const baseSpeed = 4;
  const maxSpeed = 22;

  // Fake key generator
  const generateFakeKey = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let out = "sk-";
    for (let i = 0; i < 40; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  };

  const spawnEgg = () => {
    const x = Math.random() * (window.innerWidth - 100) + 50;
    const y = Math.random() * (window.innerHeight - 100) + 50;
    posRef.current = { x, y };
    setEggPos({ x, y });
  };

  useEffect(() => spawnEgg(), []);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion) return; // no chasing
    mouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const freezeMovement = () => {
    movementEnabled.current = false;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "F5") {
        e.preventDefault();
        freezeMovement();
        setStatus("Movement frozen. You can now catch the egg.");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const resetGame = () => {
    movementEnabled.current = true;
    caughtRef.current = false;
    setShowSecret(false);
    setFakeKey("");
    spawnEgg();
    setStatus("Game reset.");

    requestRef.current = requestAnimationFrame(animate);
  };

  const animate = () => {
    if (!movementEnabled.current || prefersReducedMotion) return;

    const mouse = mouseRef.current;
    const pos = posRef.current;

    const dx = pos.x - mouse.x;
    const dy = pos.y - mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < dangerRadius) {
      const normalized = (dangerRadius - distance) / dangerRadius;
      const t = Math.pow(normalized, 1.8);
      const speed = baseSpeed + (maxSpeed - baseSpeed) * t;

      const nx = dx / distance;
      const ny = dy / distance;

      let newX = pos.x + nx * speed;
      let newY = pos.y + ny * speed;

      const w = window.innerWidth;
      const h = window.innerHeight;

      if (newX < -40) newX = w + 40;
      if (newX > w + 40) newX = -40;
      if (newY < -40) newY = h + 40;
      if (newY > h + 40) newY = -40;

      posRef.current = {
        x: pos.x + (newX - pos.x) * easing,
        y: pos.y + (newY - pos.y) * easing
      };

      setEggPos(posRef.current);
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!prefersReducedMotion) {
      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    }
  }, [prefersReducedMotion]);

  const handleEggClick = () => {
    if (!caughtRef.current) {
      caughtRef.current = true;
      movementEnabled.current = false;
      const key = generateFakeKey();
      setFakeKey(key);
      setShowSecret(true);
      setStatus("You caught the egg! Secret revealed.");
    } else {
      resetGame();
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
        textAlign: "center",
        minHeight: "120vh"
      }}
    >
      {/* Screen reader status messages */}
      <div aria-live="polite" className="visually-hidden">
        {status}
      </div>

      <h1>About Us</h1>

      {/* Typing effect is decorative, so screen readers get plain text */}
      <p
        aria-label="We are two students in UW–Madison’s CS571. Try to press the egg to reveal a secret."
        style={{
          fontSize: "1.3rem",
          color: "#333",
          marginBottom: "30px"
        }}
      >
        <span aria-hidden="true">
          We are two students in UW–Madison’s CS571. Try to press the egg to reveal a secret!
        </span>
      </p>

      {/* The Egg (interactive button) */}
      <button
        onClick={handleEggClick}
        aria-label={
          !caughtRef.current
            ? "Catch the egg to reveal a secret"
            : "Secret shown. Click again to reset the game"
        }
        style={{
          position: "fixed",
          left: eggPos.x + "px",
          top: eggPos.y + "px",
          transform: "translate(-50%, -50%)",
          background: "#c5050c",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: "50%",
          cursor: "pointer",
          fontWeight: "700",
          fontSize: "1.3rem",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          zIndex: 9999
        }}
      >
        🥚
      </button>

      {showSecret && (
        <div style={{ marginTop: "60px", fontSize: "1.2rem", color: "#444" }}>
          <p>
            🔮 <em>You caught the egg!</em>
          </p>

          <p>Here is an OpenAI API key:</p>

          <pre
            style={{
              marginTop: "10px",
              padding: "12px",
              background: "#f4f4f4",
              borderRadius: "8px",
              display: "inline-block",
              fontSize: "1.1rem"
            }}
          >
            {fakeKey}
          </pre>

          <p style={{ marginTop: "20px", color: "#666" }}>
            Click the egg again to restart.
          </p>
        </div>
      )}
    </div>
  );
}
