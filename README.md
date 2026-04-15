# BurnLens site

Public landing page for BurnLens, a public-interest wildfire planning support initiative.

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

If the server-side contact route is not configured, the page will gracefully fall back to the public email draft flow.
