// Exact six rows of the saved ReefExposure_Comparison; display rounding is separate.
// This is mapped historical reef/hardbottom area, not current coral cover.
export const exposureClasses = [
  { key: "low", label: "Below 4", color: "#C7CDBF" },
  { key: "medium", label: "4 to below 8", color: "#CB7A5C" },
  { key: "high", label: "8 or above", color: "#85412C" },
  { key: "unknown", label: "No valid DHW", color: "#E9E2D8" },
] as const;
export const exposureRows = [
  { year: 2015, key: "high", cells: 43, ha: 4731.233252206985, all: 82.97082064150482, assessed: 100 },
  { year: 2015, key: "unknown", cells: 8, ha: 971.0524617663688, all: 17.029179358495156, assessed: null },
  { year: 2019, key: "low", cells: 5, ha: 471.81512878167473, all: 8.274140449074652, assessed: 9.972349779237506 },
  { year: 2019, key: "medium", cells: 4, ha: 647.2624550632985, all: 11.35092991705401, assessed: 13.680628718978696 },
  { year: 2019, key: "high", cells: 34, ha: 3612.1556683620124, all: 63.34575027537617, assessed: 76.34702150178381 },
  { year: 2019, key: "unknown", cells: 8, ha: 971.0524617663688, all: 17.029179358495156, assessed: null },
] as const;
export const allHabitatHa = 5702.285713973354;
export const assessedHabitatHa = 4731.233252206985;

