import { ImageResponse } from "next/og";

export const alt =
  "OpenClaw Showcase public documentation folio; the excluded runtime was not inspected or evaluated";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const layers = [
  ["01", "PUBLIC", "workflow · review · limits", "#C7CDBF", "#222222"],
  ["02", "APPROVAL-GATED", "interpretation · release · claims", "#CB7A5C", "#222222"],
  ["03", "NOT INSPECTED", "excluded runtime · no capability claim", "#314E54", "#FFFFFF"],
] as const;

export default function OpenClawShowcaseOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#F7F3ED",
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
            borderRight: "1px solid #222222",
          }}
        >
          <div style={{ display: "flex", fontSize: 17, letterSpacing: 3.4, color: "#314E54" }}>
            OPENCLAW SHOWCASE / PUBLIC DOCUMENTATION ARTIFACT
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
              The public record stops at the runtime boundary.
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
              A conceptual workflow and one sanitized representative receipt—not runtime proof.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 17, color: "#5F5F5F" }}>
            DREW BAKER · PUBLIC DOCUMENTATION LAYER
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
            <span style={{ display: "flex" }}>DISCLOSURE FOLIO</span>
            <span style={{ display: "flex", color: "#7A3828" }}>FROZEN SNAPSHOT</span>
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
                    color: index === 2 ? "#C7CDBF" : index === 1 ? "#222222" : "#7A3828",
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
                    maxWidth: 138,
                    fontSize: 13,
                    lineHeight: 1.25,
                    textAlign: "right",
                  }}
                >
                  {note}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              fontSize: 13,
              lineHeight: 1.25,
              letterSpacing: 1.2,
              color: "#5F5F5F",
            }}
          >
            <span style={{ display: "flex" }}>8 PUBLIC DOCUMENTS · 9 CONCEPTUAL DIAGRAMS</span>
            <span style={{ display: "flex" }}>EXCLUDED RUNTIME NOT INSPECTED OR EVALUATED</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
