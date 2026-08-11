import { ImageResponse } from "next/og";

export const alt =
  "William Drew Baker — evidence-bound software, geospatial, climate, and infrastructure work";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const evidenceCells = [
  ["C.01", "CLAIM", "Systems for uncertain terrain"],
  ["E.01", "EVIDENCE", "Inspectable work and tests"],
  ["B.01", "BOUNDARY", "Limits stated in public"],
] as const;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#E9E2D8",
          color: "#222222",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "62px 68px 54px",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            borderBottom: "2px solid #222222",
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: 20,
          }}
        >
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: "0.12em" }}>
            WILLIAM DREW BAKER
          </div>
          <div style={{ color: "#5C757A", display: "flex", fontSize: 17, letterSpacing: "0.2em" }}>
            NORDIC FIELD ATLAS / 001
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 960 }}>
          <div style={{ color: "#757F64", display: "flex", fontSize: 24, letterSpacing: "0.12em" }}>
            SOFTWARE · GEOSPATIAL EVIDENCE · CLIMATE + INFRASTRUCTURE
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              lineHeight: 1.02,
              marginTop: 18,
            }}
          >
            Evidence-bound systems for uncertain terrain.
          </div>
        </div>

        <div style={{ borderTop: "1px solid #757F64", display: "flex", width: "100%" }}>
          {evidenceCells.map(([id, label, text], index) => (
            <div
              key={id}
              style={{
                borderLeft: index === 0 ? "none" : "1px solid #757F64",
                display: "flex",
                flex: 1,
                flexDirection: "column",
                gap: 8,
                padding: index === 0 ? "20px 24px 0 0" : "20px 24px 0",
              }}
            >
              <div style={{ color: index === 2 ? "#CB7A5C" : "#5C757A", display: "flex", fontSize: 17, fontWeight: 700 }}>
                {id} / {label}
              </div>
              <div style={{ display: "flex", fontSize: 22 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
