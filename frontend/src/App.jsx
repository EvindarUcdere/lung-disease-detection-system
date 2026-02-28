import { useState, useCallback, useRef } from "react";

const API_URL = "http://localhost:5000";

// ─── Renk & İkon Yardımcıları ────────────────────────────────────────────────
const getGlowColor = (color) => `${color}40`;

// ─── Bileşenler ──────────────────────────────────────────────────────────────

function ProbabilityBar({ item, index }) {
  return (
    <div
      style={{
        opacity: 1,
        animation: `fadeSlideIn 0.4s ease forwards`,
        animationDelay: `${index * 0.08}s`,
        animationFillMode: "both",
        opacity: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "13px", color: "#cbd5e1", fontFamily: "'DM Mono', monospace" }}>
          {item.icon} {item.class}
        </span>
        <span style={{ fontSize: "13px", fontWeight: 700, color: item.color, fontFamily: "'DM Mono', monospace" }}>
          {item.probability.toFixed(1)}%
        </span>
      </div>
      <div style={{
        height: "8px",
        background: "#1e293b",
        borderRadius: "99px",
        overflow: "hidden",
        border: `1px solid ${item.color}30`
      }}>
        <div
          style={{
            height: "100%",
            width: `${item.probability}%`,
            background: `linear-gradient(90deg, ${item.color}99, ${item.color})`,
            borderRadius: "99px",
            transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: `0 0 8px ${item.color}80`,
          }}
        />
      </div>
    </div>
  );
}

function DropZone({ onFileSelect, isDragging, setIsDragging }) {
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFileSelect(file);
  }, [onFileSelect, setIsDragging]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  return (
    <div
      onClick={() => inputRef.current.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      style={{
        border: `2px dashed ${isDragging ? "#38bdf8" : "#334155"}`,
        borderRadius: "16px",
        padding: "48px 32px",
        textAlign: "center",
        cursor: "pointer",
        background: isDragging ? "#38bdf810" : "#0f172a",
        transition: "all 0.25s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow effect when dragging */}
      {isDragging && (
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center, #38bdf820 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
      )}

      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🩻</div>
      <p style={{ color: "#94a3b8", fontSize: "15px", margin: 0 }}>
        Röntgen görüntüsünü buraya sürükleyin
      </p>
      <p style={{ color: "#475569", fontSize: "13px", marginTop: "8px" }}>
        veya <span style={{ color: "#38bdf8" }}>dosya seçin</span>
      </p>
      <p style={{ color: "#334155", fontSize: "11px", marginTop: "12px", fontFamily: "'DM Mono', monospace" }}>
        PNG · JPG · WEBP · DICOM
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
      />
    </div>
  );
}

function ResultCard({ result }) {
  return (
    <div style={{
      background: "#0f172a",
      border: `1px solid ${result.color}40`,
      borderRadius: "20px",
      padding: "28px",
      boxShadow: `0 0 40px ${result.color}20`,
      animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
    }}>
      {/* Ana tanı */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          background: `${result.color}15`,
          border: `1px solid ${result.color}40`,
          borderRadius: "99px",
          padding: "10px 24px",
          marginBottom: "16px"
        }}>
          <span style={{ fontSize: "24px" }}>{result.icon}</span>
          <span style={{ fontSize: "18px", fontWeight: 700, color: result.color }}>
            {result.prediction}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span style={{ color: "#64748b", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>
            GÜVENİLİRLİK
          </span>
          <span style={{
            fontSize: "28px", fontWeight: 900,
            color: result.confidence >= 85 ? "#22c55e" : result.confidence >= 60 ? "#f59e0b" : "#ef4444",
            fontFamily: "'DM Mono', monospace"
          }}>
            %{result.confidence.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Tüm olasılıklar */}
      <div style={{
        borderTop: "1px solid #1e293b",
        paddingTop: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}>
        <p style={{ color: "#475569", fontSize: "11px", margin: 0, fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
          TÜM SINIF OLASILIKLARI
        </p>
        {result.all_probabilities.map((item, i) => (
          <ProbabilityBar key={item.class} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

// ─── Ana Uygulama ─────────────────────────────────────────────────────────────
export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [apiStatus, setApiStatus] = useState("unknown"); // "ok" | "error" | "unknown"

  // API sağlık kontrolü
  const checkApi = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      setApiStatus(data.status === "ok" && data.model_loaded ? "ok" : "error");
    } catch {
      setApiStatus("error");
    }
  }, []);

  // İlk yüklemede kontrol et
  useState(() => { checkApi(); });

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sunucu hatası");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #020817;
          font-family: 'Sora', sans-serif;
          color: #e2e8f0;
          min-height: 100vh;
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scanLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }

        .predict-btn {
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          border: none;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Sora', sans-serif;
          padding: 14px 32px;
          width: 100%;
          transition: all 0.2s ease;
          letter-spacing: 0.02em;
        }
        .predict-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px #0ea5e940;
        }
        .predict-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .reset-btn {
          background: transparent;
          border: 1px solid #334155;
          border-radius: 12px;
          color: #64748b;
          cursor: pointer;
          font-size: 13px;
          font-family: 'Sora', sans-serif;
          padding: 10px 24px;
          transition: all 0.2s ease;
          margin-top: 8px;
          width: 100%;
        }
        .reset-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
        }
      `}</style>

      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "40px 24px",
        minHeight: "100vh",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "99px",
            padding: "6px 16px",
            marginBottom: "24px",
          }}>
            <div style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: apiStatus === "ok" ? "#22c55e" : apiStatus === "error" ? "#ef4444" : "#f59e0b",
              animation: "pulse 2s infinite"
            }} />
            <span style={{
              fontSize: "12px",
              color: apiStatus === "ok" ? "#22c55e" : apiStatus === "error" ? "#ef4444" : "#f59e0b",
              fontFamily: "'DM Mono', monospace"
            }}>
              {apiStatus === "ok" ? "API BAĞLANTISI TAMAM" : apiStatus === "error" ? "API BAĞLANAMADI" : "API KONTROL EDİLİYOR"}
            </span>
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #e2e8f0 0%, #38bdf8 50%, #818cf8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1.1,
            marginBottom: "16px"
          }}>
            Akciğer Hastalığı<br />Tespit Sistemi
          </h1>
          <p style={{ color: "#475569", fontSize: "15px", maxWidth: "480px", margin: "0 auto" }}>
            Röntgen görüntüsü yükleyin, yapay zeka modelimiz <br />
            <span style={{ color: "#94a3b8" }}>akciğer çökmesi · sağlıklı · verem · zatürre</span>
            <br /> sınıflandırması yapsın.
          </p>
        </div>

        {/* Ana İçerik */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          alignItems: "start"
        }}>

          {/* Sol Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {!preview ? (
              <DropZone
                onFileSelect={handleFileSelect}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
              />
            ) : (
              <div style={{
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #1e293b",
                position: "relative",
                background: "#000"
              }}>
                <img
                  src={preview}
                  alt="Yüklenen görüntü"
                  style={{ width: "100%", display: "block", maxHeight: "400px", objectFit: "contain" }}
                />
                {loading && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "#00000080",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexDirection: "column", gap: "16px"
                  }}>
                    {/* Scan line effect */}
                    <div style={{
                      position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none"
                    }}>
                      <div style={{
                        position: "absolute", left: 0, right: 0, height: "3px",
                        background: "linear-gradient(90deg, transparent, #38bdf8, transparent)",
                        animation: "scanLine 1.5s linear infinite"
                      }} />
                    </div>
                    <div style={{
                      width: "40px", height: "40px",
                      border: "3px solid #38bdf820",
                      borderTop: "3px solid #38bdf8",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite"
                    }} />
                    <span style={{ color: "#38bdf8", fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>
                      ANALİZ EDİLİYOR...
                    </span>
                  </div>
                )}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(transparent, #000000cc)",
                  padding: "20px 16px 12px",
                }}>
                  <p style={{
                    color: "#94a3b8", fontSize: "12px",
                    fontFamily: "'DM Mono', monospace",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>
                    📁 {file?.name}
                  </p>
                </div>
              </div>
            )}

            {/* Butonlar */}
            {file && (
              <>
                <button
                  className="predict-btn"
                  onClick={handlePredict}
                  disabled={loading}
                >
                  {loading ? "⏳ Analiz Ediliyor..." : "🔬 Teşhis Et"}
                </button>
                <button className="reset-btn" onClick={handleReset}>
                  ✕ Temizle
                </button>
              </>
            )}

            {/* API hata uyarısı */}
            {apiStatus === "error" && (
              <div style={{
                background: "#ef444415",
                border: "1px solid #ef444440",
                borderRadius: "12px",
                padding: "14px 16px",
                fontSize: "13px",
                color: "#fca5a5"
              }}>
                <strong>⚠️ API Bağlantısı Kurulamadı</strong>
                <br />
                <span style={{ color: "#94a3b8" }}>
                  Python backend'i başlatın:{" "}
                  <code style={{ color: "#38bdf8", fontFamily: "'DM Mono', monospace" }}>
                    python app.py
                  </code>
                </span>
              </div>
            )}
          </div>

          {/* Sağ Panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {result ? (
              <ResultCard result={result} />
            ) : (
              <div style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "20px",
                padding: "32px",
                textAlign: "center"
              }}>
                {/* Placeholder içerik */}
                <div style={{ fontSize: "64px", marginBottom: "20px", opacity: 0.3 }}>🫁</div>
                <p style={{ color: "#334155", fontSize: "14px" }}>
                  Görüntü yükleyip analiz ettikten sonra<br />sonuçlar burada görünecek.
                </p>

                {/* Sınıf bilgileri */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "10px", marginTop: "28px"
                }}>
                  {[
                    { icon: "🫁", label: "Akciğer Çökmesi", color: "#ef4444", count: "10.047" },
                    { icon: "✅", label: "Sağlıklı", color: "#22c55e", count: "6.666" },
                    { icon: "🦠", label: "Verem", color: "#f59e0b", count: "3.369" },
                    { icon: "🤒", label: "Zatürre", color: "#3b82f6", count: "4.273" },
                  ].map((c) => (
                    <div key={c.label} style={{
                      background: "#020817",
                      border: `1px solid ${c.color}25`,
                      borderRadius: "12px",
                      padding: "14px",
                      textAlign: "left"
                    }}>
                      <div style={{ fontSize: "20px", marginBottom: "6px" }}>{c.icon}</div>
                      <div style={{ fontSize: "12px", color: c.color, fontWeight: 600 }}>{c.label}</div>
                      <div style={{ fontSize: "11px", color: "#334155", fontFamily: "'DM Mono', monospace", marginTop: "4px" }}>
                        {c.count} görüntü
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div style={{
                background: "#ef444415",
                border: "1px solid #ef444440",
                borderRadius: "12px",
                padding: "16px",
                color: "#fca5a5",
                fontSize: "14px",
                animation: "popIn 0.3s ease"
              }}>
                <strong>❌ Hata:</strong> {error}
              </div>
            )}

            {/* Model bilgisi */}
            <div style={{
              background: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "16px",
              padding: "20px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px"
            }}>
              {[
                { label: "MODEL", value: "MobileNetV2" },
                { label: "GİRDİ", value: "128×128 px" },
                { label: "EPOCH", value: "15" },
                { label: "SINIF", value: "4 kategori" },
              ].map((info) => (
                <div key={info.label}>
                  <div style={{ color: "#334155", fontSize: "10px", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
                    {info.label}
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 600, marginTop: "2px" }}>
                    {info.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: "48px", color: "#1e293b", fontSize: "12px", fontFamily: "'DM Mono', monospace" }}>
          AI destekli tıbbi görüntü analizi · MobileNetV2 Transfer Öğrenme
        </div>
      </div>
    </>
  );
}
