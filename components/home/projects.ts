import type { ProjectImageRevealProps } from "./ProjectImageReveal";

// Preview selection only; this does not change the project's flagship registry.
export const homepageProjects = [
  {
    title:"Runbook Sentinel", href:"/work/runbook-sentinel",
    skills:["Python","SQLite","API design"],
    description:"I developed a synthetic incident-response testbed that separates diagnosis, proposals and permission to act.",
    thumbnail:{src:"/media/projects/homepage-reveal/runbook-interface-thumbnail-v2.webp",width:320,height:380},
    expanded:{src:"/media/projects/homepage-reveal/runbook-interface-expanded-v2.webp",width:1168,height:600},
    expandedMobile:{src:"/media/projects/homepage-reveal/runbook-interface-expanded-mobile-v2.webp",width:640,height:640},
    imageDescription:"Cropped frozen Runbook Sentinel dashboard showing deterministic agent configuration and synthetic evaluation fields. Real infrastructure disconnected; not a live operations console.",
    imageContext:["Frozen synthetic interface","Real infrastructure disconnected"], priority:true,
    imageSurface:"#09111e",
  },
  {
    title:"West Hawaiʻi heat", href:"/work/west-hawaii-heat-exposure",
    skills:["ArcGIS Pro","Spatial joins","Satellite data"],
    description:"I worked through a guided ArcGIS workflow to correct coastal coverage.",
    thumbnail:{src:"/media/projects/homepage-reveal/west-hawaii-thumbnail.webp",width:320,height:380},
    expanded:{src:"/media/projects/homepage-reveal/west-hawaii-expanded.webp",width:1168,height:600},
    expandedMobile:{src:"/media/projects/homepage-reveal/west-hawaii-expanded-mobile.webp",width:640,height:640},
    imageDescription:"Saved West Hawaiʻi habitat-area comparison. Annual maximum DHW (°C-weeks), same 5,702.29 ha historical reef/hardbottom denominator: 2015—8 or above 83.0%, unavailable 17.0%; 2019—below 4 8.3%, 4 to below 8 11.4%, 8 or above 63.3%, unavailable 17.0%. Satellite heat exposure, not observed coral condition.",
    imageContext:["2015 / 2019 · annual max DHW","5,702.29 ha mapped habitat","17.0% unavailable"],
    imageSurface:"#e9e2d8",
    credit:"NOAA Coral Reef Watch; NOAA/NCCOS and Analytical Laboratories of Hawaii. Saved-data comparison over historical habitat mapped from 2004–06 imagery—not observed coral condition.",
  },
  {
    title:"Nepal Satellite Atlas", href:"/work/nepal-satellite-atlas",
    skills:["ArcGIS Pro","Cartography","Satellite imagery"],
    description:"I defined an ArcGIS atlas I could open, compare and export.",
    thumbnail:{src:"/media/projects/homepage-reveal/nepal-thumbnail.webp",width:320,height:380},
    expanded:{src:"/media/projects/homepage-reveal/nepal-expanded.webp",width:1168,height:600},
    expandedMobile:{src:"/media/projects/homepage-reveal/nepal-expanded-mobile.webp",width:640,height:640},
    imageDescription:"Screenshot excerpts of Sentinel-1D radar views dated 16 and 28 August 2026. Registration unverified. Blank regions are excluded data, not evidence of no change; this is not a mapped landslide result.",
    imageContext:["16 & 28 August 2026","Radar excerpt · −30 to 0 dB","Registration unverified"],
    imageSurface:"#fffeff",
    credit:"ASF DAAC HyP3 2026. Contains modified Copernicus Sentinel data 2026, processed by ESA. Cropped excerpts; full map, legend and scale remain on the project page.",
  },
] satisfies readonly ProjectImageRevealProps[];
