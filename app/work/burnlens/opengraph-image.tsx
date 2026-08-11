import { ImageResponse } from "next/og";

export const alt = "BurnLens — a baseline earned the right to stay";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function BurnLensOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#222222",
          color: "#FFFFFF",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 770,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 70px",
            borderRight: "1px solid rgba(255,255,255,.25)",
          }}
        >
          <div style={{ display: "flex", fontSize: 20, letterSpacing: 4, color: "#C7CDBF" }}>
            BURNLENS / CASE STUDY 01
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "flex", fontSize: 74, lineHeight: 1.02, letterSpacing: -3 }}>
              A baseline earned the right to stay.
            </div>
            <div style={{ display: "flex", maxWidth: 590, fontSize: 26, lineHeight: 1.35, color: "#E9E2D8" }}>
              Accepted RBR. Rejected U-Net. Official context kept separate.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 20, color: "#C7CDBF" }}>
            DREW BAKER · EVIDENCE-BOUND SYSTEMS
          </div>
        </div>
        <div
          style={{
            width: 430,
            display: "flex",
            flexDirection: "column",
            padding: "64px 52px",
            background: "#5C757A",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", borderTop: "3px solid #FFFFFF" }}>
            {[
              ["C.01", "Baseline retained"],
              ["E.01", "Dice / IoU 1.000"],
              ["B.01", "Non-operational"],
            ].map(([label, value], index) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  gap: 28,
                  padding: "30px 0",
                  borderBottom: "1px solid rgba(255,255,255,.4)",
                }}
              >
                <div style={{ display: "flex", width: 64, fontSize: 18, color: index === 2 ? "#E9E2D8" : "#FFFFFF" }}>
                  {label}
                </div>
                <div style={{ display: "flex", flex: 1, fontSize: 27, lineHeight: 1.2 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
