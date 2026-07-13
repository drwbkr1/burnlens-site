# BurnLens Deschutes site

Public landing page for BurnLens Deschutes, an experimental, portfolio-first computer vision and GEOINT wildfire-screening project for Deschutes County, Oregon.

The site describes a documented future workflow and its limitations. It does not represent an operational system, completed data or model work, official wildfire information, emergency guidance, evacuation or routing support, field validation, or agency endorsement.

Official county, state, federal, fire-service, emergency-management, transportation, and incident sources govern for current wildfire and public-safety information.

## Local development

```bash
npm install
npm run dev
```

## Environment variables

Copy `.env.example` to `.env.local` and set values as needed.

- `NEXT_PUBLIC_CONTACT_EMAIL`: fallback email used by the client to open a mail draft.
- `CONTACT_TO_EMAIL`: inbox that receives contact submissions.
- `CONTACT_FROM_EMAIL`: sender address configured with Resend.
- `RESEND_API_KEY`: API key for Resend.

If the server-side contact route is not configured, the page falls back to the public email draft flow.