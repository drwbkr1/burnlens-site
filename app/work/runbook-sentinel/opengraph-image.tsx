import { ImageResponse } from "next/og";

export const alt =
  "Runbook Sentinel software control trace separating evidence and model output from approval and synthetic execution";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const signalNodes = ["EVIDENCE", "BOUNDED AGENT", "PROPOSAL"];
const authorityNodes = ["SEPARATE APPROVAL", "FIXED GATE", "SYNTHETIC STATE"];

export default function RunbookSentinelOpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#E9E2D8",
          color: "#222222",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: 680,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "54px 58px",
            borderRight: "2px solid #222222",
          }}
        >
          <div style={{ display: "flex", fontSize: 17, letterSpacing: 3, color: "#314E54" }}>
            RUNBOOK SENTINEL / SOFTWARE FLAGSHIP
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", maxWidth: 570, fontSize: 66, lineHeight: 0.98, letterSpacing: -3 }}>
              The model is not the control plane.
            </div>
            <div style={{ display: "flex", maxWidth: 555, fontSize: 22, lineHeight: 1.35, color: "#48513F" }}>
              A tested local model failed the fixed contract. Deterministic control stayed.
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 16, letterSpacing: 1.5, color: "#454843" }}>
            VERIFIED SYNTHETIC TESTBED · v0.0.20 · ZERO REAL SYSTEMS
          </div>
        </div>

        <div
          style={{
            width: 520,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 22,
            padding: "42px 38px",
            background: "#222222",
            color: "#FFFFFF",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#C7CDBF", fontSize: 14, letterSpacing: 2 }}>
              <span style={{ display: "flex" }}>SIGNAL RAIL</span>
              <span style={{ display: "flex" }}>MAY INFORM</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {signalNodes.map((node, index) => (
                <div key={node} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div
                    style={{
                      minHeight: 62,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px",
                      border: "2px dashed #C7CDBF",
                      color: "#FFFFFF",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    {node}
                  </div>
                  {index < signalNodes.length - 1 ? (
                    <span style={{ display: "flex", padding: "0 2px", color: "#C7CDBF" }}>→</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              padding: "12px",
              border: "2px solid #CB7A5C",
              color: "#FFFFFF",
              fontSize: 15,
              letterSpacing: 1.2,
            }}
          >
            <span style={{ display: "flex", color: "#CB7A5C", fontSize: 26 }}>○ ／ ○</span>
            NO AUTHORITY ALONE
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#C7CDBF", fontSize: 14, letterSpacing: 2 }}>
              <span style={{ display: "flex" }}>AUTHORITY RAIL</span>
              <span style={{ display: "flex" }}>MAY CHANGE SYNTHETIC STATE</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {authorityNodes.map((node, index) => (
                <div key={node} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div
                    style={{
                      minHeight: 62,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "8px",
                      border: "2px solid #757F64",
                      background: index === 2 ? "#C7CDBF" : "#314E54",
                      color: index === 2 ? "#222222" : "#FFFFFF",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    {node}
                  </div>
                  {index < authorityNodes.length - 1 ? (
                    <span style={{ display: "flex", padding: "0 2px", color: "#C7CDBF" }}>→</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
