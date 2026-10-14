import { ImageResponse } from "next/og";

export const alt =
  "Drew Baker — data and complex ideas made into usable software, maps and interactive experiences";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const projectThemes = [
  ["01", "SOFTWARE", "From question to product"],
  ["02", "MAPS", "Environmental questions"],
  ["03", "INTERACTION", "Data, play and sound"],
] as const;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#12232F",
          color: "#F0F9FC",
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
            borderBottom: "2px solid #4B7182",
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: 20,
          }}
        >
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: "0.12em" }}>
            DREW BAKER
          </div>
          <div style={{ color: "#BDD3DF", display: "flex", fontSize: 17, letterSpacing: "0.2em" }}>
            PERSONAL PORTFOLIO / 2026
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 960 }}>
          <div style={{ color: "#A7E0F1", display: "flex", fontSize: 24, letterSpacing: "0.12em" }}>
            SOFTWARE · MAPS · INTERACTIVE EXPERIENCES
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              lineHeight: 1.02,
              marginTop: 18,
            }}
          >
            <div style={{ display: "flex" }}>Data and complex ideas,</div>
            <div style={{ display: "flex" }}>made usable.</div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #4B7182", display: "flex", width: "100%" }}>
          {projectThemes.map(([id, label, text], index) => (
            <div
              key={id}
              style={{
                borderLeft: index === 0 ? "none" : "1px solid #4B7182",
                display: "flex",
                flex: 1,
                flexDirection: "column",
                gap: 8,
                padding: index === 0 ? "20px 24px 0 0" : "20px 24px 0",
              }}
            >
              <div style={{ color: "#A7E0F1", display: "flex", fontSize: 17, fontWeight: 700 }}>
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
