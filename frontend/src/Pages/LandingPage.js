// src/Pages/LandingPage.js
import React, { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

const REFRESH_MS = 15_000;

// ---- 1) BURAYI KENDİ FORMUNLA DOLDUR ----
const FORM_BASE = "https://forms.gle/NmKiV23wNNbF391n8"; // <-- kendi formunun viewform URL'i

// Google Form'daki soru kimlikleri (Get pre-filled link ile yakala)
const ENTRY = {
  token: "entry.1111111111", // "Token" sorusunun kimliği
  issuedAt: "entry.2222222222", // "IssuedAt" sorusunun kimliği
  expiresAt: "entry.3333333333", // "ExpiresAt" sorusunun kimliği
  // "Ad Soyad" ve "Yer" kullanıcı tarafından doldurulacak; istersen bunlara da kimlik ekleyip prefill yapabilirsin.
};
// -----------------------------------------

function genTokenHex() {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function makePayload() {
  const now = Date.now();
  return { token: genTokenHex(), issuedAt: now, expiresAt: now + REFRESH_MS };
}

function buildPrefillURL(p) {
  const params = new URLSearchParams({ usp: "pp_url" });
  params.set(ENTRY.token, p.token);
  params.set(ENTRY.issuedAt, String(p.issuedAt));
  params.set(ENTRY.expiresAt, String(p.expiresAt));
  return `${FORM_BASE}?${params.toString()}`;
}

export default function LandingPage() {
  const [payload, setPayload] = useState(() => makePayload());
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const refresh = setInterval(() => setPayload(makePayload()), REFRESH_MS);
    return () => clearInterval(refresh);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((payload.expiresAt - now) / 1000));
  const qrValue = useMemo(() => buildPrefillURL(payload), [payload]);

  const handleManualRefresh = () => setPayload(makePayload());

  const wrap = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f6f7fb",
    padding: 24,
  };
  const card = {
    width: 420,
    maxWidth: "100%",
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 12px 40px rgba(0,0,0,.08)",
    padding: 24,
    textAlign: "center",
  };
  const title = { margin: "0 0 4px", fontSize: 22, fontWeight: 700 };
  const subtitle = { margin: "0 0 16px", color: "#6b7280", fontSize: 14 };
  const qrBox = {
    display: "inline-block",
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    marginBottom: 12,
  };
  const timer = {
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
    marginBottom: 12,
  };
  const btn = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={title}>PDKS SİSTEMİ</h1>
        <p style={subtitle}>
          QR her {REFRESH_MS / 1000} saniyede bir otomatik yenilenir. Taranınca
          Google Form açılır.
        </p>

        <div style={qrBox}>
          <QRCode value={qrValue} size={256} />
        </div>

        <div style={timer}>
          Yenilenmeye kalan: {secondsLeft.toString().padStart(2, "0")} sn
        </div>

        <button style={btn} onClick={handleManualRefresh}>
          Şimdi Yenile
        </button>
      </div>
    </div>
  );
}
