import { ImageResponse } from "next/og";

export const alt = "Runbook Sentinel — the model is not the control plane";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const nodes = [
  ["01", "MODEL", "signal only"],
  ["02", "PROPOSAL", "no authority"],
  ["03", "GATE", "control"],
];

export default function RunbookSentinelOpenGraphImage() {
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
            width: 740,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 66px",
            borderRight: "1px solid rgba(34,34,34,.24)",
          }}
        >
          <div style={{ display: "flex", fontSize: 18, letterSpacing: 3.5, color: "#2E4B51" }}>
            RUNBOOK SENTINEL / CASE 02
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 21 }}>
            <div style={{ display: "flex", maxWidth: 610, fontSize: 68, lineHeight: 0.98, letterSpacing: -3.2 }}>
              The model is not the control plane.
            </div>
            <div style={{ display: "flex", maxWidth: 590, fontSize: 24, lineHeight: 1.35, color: "#48513F" }}>
              93 frozen attempts. Exact outcomes. Zero real systems connected.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 18, color: "#555A55" }}>
            DREW BAKER · EVIDENCE-BOUND SYSTEMS
          </div>
        </div>

        <div
          style={{
            width: 460,
            display: "flex",
            flexDirection: "column",
            padding: "54px 45px",
            background: "#2E4B51",
            color: "#FFFFFF",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingBottom: 15,
              borderBottom: "3px solid #FFFFFF",
              fontSize: 15,
              letterSpacing: 2,
            }}
          >
            <span style={{ display: "flex" }}>AUTHORITY ISOLATOR</span>
            <span style={{ display: "flex", color: "#F0B9A4" }}>OPEN</span>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {nodes.map(([number, title, note], index) => (
              <div key={number} style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    minHeight: 82,
                    display: "flex",
                    alignItems: "center",
                    padding: "13px 16px",
                    border: index === 1 ? "2px solid #CB7A5C" : "1px solid rgba(255,255,255,.55)",
                  }}
                >
                  <span style={{ display: "flex", width: 46, color: "#C7CDBF", fontSize: 15 }}>{number}</span>
                  <span style={{ display: "flex", flex: 1, fontSize: 23, letterSpacing: 1 }}>{title}</span>
                  <span style={{ display: "flex", color: "#D7DEDB", fontSize: 14 }}>{note}</span>
                </div>
                {index < nodes.length - 1 ? (
                  <div
                    style={{
                      display: "flex",
                      alignSelf: "center",
                      width: 2,
                      height: 12,
                      background: index === 1 ? "#CB7A5C" : "#C7CDBF",
                    }}
                  />
                ) : null}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", fontSize: 14, letterSpacing: 1.5, color: "#C7CDBF" }}>
            SYNTHETIC STATE ONLY · v0.0.20
          </div>
        </div>
      </div>
    ),
    size,
  );
}
