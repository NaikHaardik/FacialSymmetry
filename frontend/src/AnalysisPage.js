import { useState, useRef, useEffect } from "react";
import axios from "axios";

const abs = Math.abs;
const BACKEND_URL = "https://facial-symmetry-backend.onrender.com";
const MetricCard = ({ label, value, unit, color }) => (
  <div
    style={{
      background: "#1a1a2e",
      borderRadius: "12px",
      padding: "1.2rem",
      textAlign: "center",
      border: `1px solid ${color}40`,
    }}
  >
    <div style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "0.4rem" }}>
      {label}
    </div>
    <div style={{ color, fontSize: "1.8rem", fontWeight: "bold" }}>
      {value}
      <span style={{ fontSize: "1rem", marginLeft: "4px" }}>{unit}</span>
    </div>
  </div>
);

const ThirdsCard = ({ thirds }) => {
  if (!thirds) return null;
  const bars = [
    {
      label: "Upper Third",
      value: thirds.upperThird,
      ideal: 33.3,
      color: "#00d4ff",
    },
    {
      label: "Middle Third",
      value: thirds.middleThird,
      ideal: 33.3,
      color: "#ff6bff",
    },
    {
      label: "Lower Third",
      value: thirds.lowerThird,
      ideal: 33.3,
      color: "#ffcc00",
    },
  ];
  return (
    <div
      style={{
        background: "#1a1a2e",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid #00d4ff20",
      }}
    >
      <div
        style={{ color: "#00d4ff", fontWeight: "bold", marginBottom: "1rem" }}
      >
        📏 Horizontal Thirds
      </div>
      <div style={{ color: "#aaa", fontSize: "0.8rem", marginBottom: "1rem" }}>
        Ideal: each third = 33.3%
      </div>
      {bars.map((bar) => (
        <div key={bar.label} style={{ marginBottom: "0.8rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.3rem",
            }}
          >
            <span style={{ color: "#ccc", fontSize: "0.85rem" }}>
              {bar.label}
            </span>
            <span
              style={{
                color: bar.color,
                fontSize: "0.85rem",
                fontWeight: "bold",
              }}
            >
              {bar.value}%
              <span
                style={{
                  color: abs(bar.value - bar.ideal) < 4 ? "#00ff88" : "#ff4444",
                  marginLeft: "6px",
                  fontSize: "0.75rem",
                }}
              >
                {abs(bar.value - bar.ideal) < 4
                  ? "✓"
                  : `${bar.value > bar.ideal ? "+" : ""}${(bar.value - bar.ideal).toFixed(1)}%`}
              </span>
            </span>
          </div>
          <div
            style={{
              background: "#0a0a1a",
              borderRadius: "4px",
              height: "8px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: `${bar.value}%`,
                height: "100%",
                background: bar.color,
                borderRadius: "4px",
                transition: "width 0.5s ease",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: `${bar.ideal}%`,
                width: "2px",
                height: "100%",
                background: "#ffffff40",
              }}
            />
          </div>
        </div>
      ))}
      <div
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          textAlign: "center",
          background:
            thirds.assessment === "Balanced" ? "#00ff8820" : "#ff444420",
          color: thirds.assessment === "Balanced" ? "#00ff88" : "#ff4444",
          fontSize: "0.85rem",
          fontWeight: "bold",
        }}
      >
        {thirds.assessment === "Balanced"
          ? "✅ Balanced Thirds"
          : "⚠️ Imbalanced Thirds"}
      </div>
      <div style={{ marginTop: "0.8rem", color: "#aaa", fontSize: "0.8rem" }}>
        Lower third — Upper lip: {thirds.lowerThirdUpperLip}% / Lower lip +
        chin: {thirds.lowerThirdLowerLip}%
        <span style={{ color: "#555", marginLeft: "6px" }}>
          (ideal 33% / 67%)
        </span>
      </div>
    </div>
  );
};

const FifthsCard = ({ fifths }) => {
  if (!fifths) return null;
  const bars = [
    { label: "Outer Left", value: fifths.firstFifth, color: "#ff6bff" },
    { label: "Left Eye", value: fifths.secondFifth, color: "#00d4ff" },
    { label: "Central (Nose)", value: fifths.thirdFifth, color: "#ffcc00" },
    { label: "Right Eye", value: fifths.fourthFifth, color: "#00d4ff" },
    { label: "Outer Right", value: fifths.fifthFifth, color: "#ff6bff" },
  ];
  return (
    <div
      style={{
        background: "#1a1a2e",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid #ff6bff20",
      }}
    >
      <div
        style={{ color: "#ff6bff", fontWeight: "bold", marginBottom: "1rem" }}
      >
        📐 Vertical Fifths
      </div>
      <div style={{ color: "#aaa", fontSize: "0.8rem", marginBottom: "1rem" }}>
        Ideal: each fifth = 20%
      </div>
      {/* Visual bar representation */}
      <div
        style={{
          display: "flex",
          height: "40px",
          borderRadius: "6px",
          overflow: "hidden",
          marginBottom: "1rem",
        }}
      >
        {bars.map((bar, i) => (
          <div
            key={i}
            style={{
              flex: bar.value,
              background: bar.color,
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.7rem",
              color: "#000",
              fontWeight: "bold",
            }}
          >
            {bar.value}%
          </div>
        ))}
      </div>
      {bars.map((bar) => (
        <div
          key={bar.label}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.4rem",
          }}
        >
          <span style={{ color: "#ccc", fontSize: "0.82rem" }}>
            {bar.label}
          </span>
          <span
            style={{
              color: bar.color,
              fontSize: "0.82rem",
              fontWeight: "bold",
            }}
          >
            {bar.value}%
          </span>
        </div>
      ))}
      <div style={{ marginTop: "0.8rem", color: "#aaa", fontSize: "0.8rem" }}>
        Nose/Eye width ratio:{" "}
        <span
          style={{
            color:
              fifths.noseEyeRatio >= 90 && fifths.noseEyeRatio <= 110
                ? "#00ff88"
                : "#ffcc00",
            fontWeight: "bold",
          }}
        >
          {fifths.noseEyeRatio}%
        </span>
        <span style={{ color: "#555", marginLeft: "6px" }}>(ideal ~100%)</span>
      </div>
      <div
        style={{
          marginTop: "0.8rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          textAlign: "center",
          background:
            fifths.assessment === "Balanced" ? "#00ff8820" : "#ff444420",
          color: fifths.assessment === "Balanced" ? "#00ff88" : "#ff4444",
          fontSize: "0.85rem",
          fontWeight: "bold",
        }}
      >
        {fifths.assessment === "Balanced"
          ? "✅ Balanced Fifths"
          : "⚠️ Asymmetric Fifths"}
      </div>
    </div>
  );
};

export default function AnalysisPage() {
  const [originalImage, setOriginalImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [landmarks, setLandmarks] = useState(null);
  const [imageSize, setImageSize] = useState(null);
  const [dragging, setDragging] = useState(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setOriginalImage(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setLandmarks(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post(`${BACKEND_URL}/api/analyze`, formData);
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setResult(res.data);
        setLandmarks(res.data.landmarks);
        setImageSize(res.data.imageSize);
      }
    } catch (err) {
      setError(
        "Failed to connect to backend. Make sure all services are running.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Draw landmarks on canvas when they change
  useEffect(() => {
    if (!landmarks || !canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    const scaleX = img.clientWidth / imageSize.width;
    const scaleY = img.clientHeight / imageSize.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw midline
    const nasion = landmarks[27];
    const menton = landmarks[8];
    const midX = ((nasion[0] + menton[0]) / 2) * scaleX;
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX, 0);
    ctx.lineTo(midX, canvas.height);
    ctx.stroke();

    // Draw eye line
    ctx.strokeStyle = "#ffff00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(landmarks[36][0] * scaleX, landmarks[36][1] * scaleY);
    ctx.lineTo(landmarks[45][0] * scaleX, landmarks[45][1] * scaleY);
    ctx.stroke();

    // Draw lip line
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(landmarks[48][0] * scaleX, landmarks[48][1] * scaleY);
    ctx.lineTo(landmarks[54][0] * scaleX, landmarks[54][1] * scaleY);
    ctx.stroke();

    // Draw jaw outline
    ctx.strokeStyle = "#64c8ff";
    ctx.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(landmarks[i][0] * scaleX, landmarks[i][1] * scaleY);
      ctx.lineTo(landmarks[i + 1][0] * scaleX, landmarks[i + 1][1] * scaleY);
      ctx.stroke();
    }

    // Draw all landmark points
    landmarks.forEach((pt, i) => {
      ctx.beginPath();
      ctx.arc(pt[0] * scaleX, pt[1] * scaleY, 5, 0, Math.PI * 2);
      ctx.fillStyle = dragging === i ? "#ff4444" : "#00d4ff";
      ctx.fill();
    });
  }, [landmarks, imageSize, dragging]);

  const handleCanvasMouseDown = (e) => {
    if (!landmarks || !canvasRef.current || !imageSize) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scaleX = canvas.width / imageSize.width;
    const scaleY = canvas.height / imageSize.height;

    // Find closest landmark within 15px
    let closest = null;
    let minDist = 15;
    landmarks.forEach((pt, i) => {
      const dx = pt[0] * scaleX - mouseX;
      const dy = pt[1] * scaleY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setDragging(closest);
  };

  const handleCanvasMouseMove = (e) => {
    if (dragging === null || !canvasRef.current || !imageSize) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scaleX = canvas.width / imageSize.width;
    const scaleY = canvas.height / imageSize.height;

    const newLandmarks = [...landmarks];
    newLandmarks[dragging] = [
      Math.round(mouseX / scaleX),
      Math.round(mouseY / scaleY),
    ];
    setLandmarks(newLandmarks);
  };

  const handleCanvasMouseUp = async () => {
    if (dragging === null) return;
    setDragging(null);

    // Recalculate metrics with corrected landmarks
    try {
      const res = await axios.post(`${BACKEND_URL}/api/recalculate`, {
        landmarks,
      });
      if (res.data.metrics) {
        setResult((prev) => ({ ...prev, metrics: res.data.metrics }));
      }
    } catch (err) {
      console.error("Recalculate failed", err);
    }
  };

  const score = result?.metrics?.symmetryScore;
  const scoreColor =
    score >= 85 ? "#00ff88" : score >= 70 ? "#ffcc00" : "#ff4444";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a1a",
        color: "white",
        fontFamily: "sans-serif",
        padding: "2rem",
      }}
    >
      <h2
        style={{ textAlign: "center", color: "#00d4ff", marginBottom: "2rem" }}
      >
        🦷 Facial Symmetry Analysis
      </h2>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Upload Area */}
        <label
          style={{
            display: "block",
            border: "2px dashed #00d4ff44",
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "2rem",
            background: "#0f0f2a",
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          <div style={{ fontSize: "2rem" }}>📁</div>
          <div style={{ color: "#aaa", marginTop: "0.5rem" }}>
            Click to upload a frontal facial photograph
          </div>
          <div
            style={{ color: "#555", fontSize: "0.8rem", marginTop: "0.3rem" }}
          >
            JPG or PNG recommended
          </div>
        </label>

        {/* Loading */}
        {loading && (
          <div
            style={{ textAlign: "center", color: "#00d4ff", padding: "2rem" }}
          >
            ⏳ Analyzing facial landmarks...
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              textAlign: "center",
              color: "#ff4444",
              background: "#ff444420",
              borderRadius: "8px",
              padding: "1rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <>
            {/* Symmetry Score */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ color: "#aaa", fontSize: "0.9rem" }}>
                Overall Symmetry Score
              </div>
              <div
                style={{
                  fontSize: "4rem",
                  fontWeight: "bold",
                  color: scoreColor,
                }}
              >
                {result.metrics.symmetryScore}%
              </div>
              <div style={{ color: "#555", fontSize: "0.8rem" }}>
                {score >= 85
                  ? "Excellent symmetry"
                  : score >= 70
                    ? "Moderate asymmetry"
                    : "Significant asymmetry"}
              </div>
            </div>

            {/* Metrics Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <MetricCard
                label="Eye Canting"
                value={result.metrics.eyeCanting}
                unit="°"
                color="#00d4ff"
              />
              <MetricCard
                label="Lip Canting"
                value={result.metrics.lipCanting}
                unit="°"
                color="#ff6bff"
              />
              <MetricCard
                label="Chin Deviation"
                value={result.metrics.chinDeviation}
                unit="%"
                color="#ffcc00"
              />
              <MetricCard
                label="Nose Deviation"
                value={result.metrics.noseDeviation}
                unit="%"
                color="#00ff88"
              />
            </div>

            {/* Horizontal Thirds and Vertical Fifths */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <ThirdsCard thirds={result.metrics.horizontalThirds} />
              <FifthsCard fifths={result.metrics.verticalFifths} />
            </div>

            {/* Images — Original + Interactive Canvas */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#aaa",
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  Original Photo
                </div>
                <img
                  src={originalImage}
                  alt="original"
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              </div>
              <div>
                <div
                  style={{
                    color: "#aaa",
                    marginBottom: "0.5rem",
                    fontSize: "0.85rem",
                  }}
                >
                  Landmark Analysis —{" "}
                  <span style={{ color: "#00d4ff" }}>
                    drag points to correct
                  </span>
                </div>
                <div
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "100%",
                  }}
                >
                  <img
                    ref={imgRef}
                    src={originalImage}
                    alt="analysis"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      display: "block",
                    }}
                    onLoad={() => setLandmarks([...landmarks])}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      cursor: "crosshair",
                      borderRadius: "8px",
                    }}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                  />
                </div>
                <div
                  style={{
                    color: "#555",
                    fontSize: "0.75rem",
                    marginTop: "0.5rem",
                  }}
                >
                  💡 Click and drag any point to manually correct its position
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
