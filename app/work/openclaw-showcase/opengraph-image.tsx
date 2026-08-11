import { ImageResponse } from "next/og";

export const alt =
  "OpenClaw Showcase — public documentation, approval-gated interpretation, private runtime";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const layers = [
  ["01", "PUBLIC", "workflow · review · limits", "#C7CDBF", "#222222"],
  ["02", "APPROVAL-GATED", "interpretation · release · claims", "#F0C5B4", "#222222"],
  ["03", "PRIVATE", "runtime · traces · authority", "#2E4B51", "#FFFFFF"],
] as const;

export default function OpenClawShowcaseOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#F8F5EF",
          color: "#222222",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 690,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "58px 64px",
            borderRight: "1px solid rgba(34,34,34,.24)",
          }}
        >
          <div style={{ display: "flex", fontSize: 17, letterSpacing: 3.4, color: "#2E4B51" }}>
            OPENCLAW SHOWCASE / PUBLIC DOCUMENTATION
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div
              style={{
                display: "flex",
                maxWidth: 560,
                fontSize: 64,
                lineHeight: 0.98,
                letterSpacing: -3,
              }}
            >
              Make the process legible. Keep authority out of frame.
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 545,
                fontSize: 22,
                lineHeight: 1.35,
                color: "#48513F",
              }}
            >
              Documentary workflow patterns—not runtime proof.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 17, color: "#555A55" }}>
            DREW BAKER · EVIDENCE-BOUND SYSTEMS
          </div>
        </div>

        <div
          style={{
            width: 510,
            display: "flex",
            flexDirection: "column",
            padding: "48px 43px",
            background: "#E9E2D8",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingBottom: 14,
              borderBottom: "3px solid #222222",
              fontSize: 14,
              letterSpacing: 2,
            }}
          >
            <span style={{ display: "flex" }}>TRANSPARENCY REGISTER</span>
            <span style={{ display: "flex", color: "#713423" }}>EXACT SNAPSHOT</span>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {layers.map(([number, label, note, background, color], index) => (
              <div
                key={number}
                style={{
                  width: 390,
                  minHeight: 105,
                  marginLeft: index * 14,
                  display: "flex",
                  alignItems: "center",
                  padding: "15px 18px",
                  border: "1px solid #222222",
                  background,
                  color,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    width: 42,
                    color: index === 2 ? "#F0C5B4" : "#713423",
                    fontSize: 14,
                  }}
                >
                  {number}
                </span>
                <span style={{ display: "flex", flex: 1, fontSize: 20, letterSpacing: 1 }}>
                  {label}
                </span>
                <span
                  style={{
                    display: "flex",
                    maxWidth: 125,
                    fontSize: 12,
                    lineHeight: 1.25,
                    textAlign: "right",
                  }}
                >
                  {note}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", fontSize: 13, letterSpacing: 1.4, color: "#555A55" }}>
            8 PUBLIC DOCUMENTS · 0 RUNTIME ARTIFACTS SHOWN
          </div>
        </div>
      </div>
    ),
    size,
  );
}
