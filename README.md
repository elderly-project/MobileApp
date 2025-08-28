## MobileApp — AI Patient Assistant (Mobile)

![Expo](https://img.shields.io/badge/Expo-51-000020?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-DB%20%7C%20Auth-3FCF8E?logo=supabase&logoColor=white)
![Voice](https://img.shields.io/badge/Voice-Agent-orange)
![RAG](https://img.shields.io/badge/RAG-Documents-blueviolet)

### What this is
A companion React Native/Expo app for the AI Patient Assistant. It focuses on mobile-first surfaces—voice conversations, appointments, medications, and document interactions—designed for real-world healthcare workflows.

### Why it’s interesting
- **Voice‑forward** mobile UX with a conversational assistant.
- **RAG‑grounded** answers aligned with the web backend’s embeddings and document sections.
- **Healthcare primitives**: appointments management, medication tracking, file uploads, and patient profile.

## Key features
- **Voice assistant surfaces** in `components/ConvAI.tsx` and `components/FallbackButton.tsx`
- **Appointments and medications** flows (`components/Appointments.tsx`, `components/Medications.tsx`)
- **Supabase integration** via `utils/supabase.ts` and typed `types/database.types.ts`
- **Shared mental model** with web app: same data model and RAG semantics

## Architecture overview
- **App shell**: `App.tsx` with feature modules under `components/`.
- **State & utilities**: lightweight hooks and helpers in `utils/` and `contexts/` (e.g., zoom, tools, voice helpers).
- **Backend alignment**: relies on the same Supabase schema and AI endpoints used by the web app.

## Tech stack
- **Expo / React Native** with TypeScript
- **Supabase** client for auth and data
- **AI voice & RAG** integrated with the ChatbotDev backend

## Notable engineering highlights
- **Fallback UX** for poor network or device capability (`FallbackButton.tsx`).
- **Typed database access** using generated types (`types/database.types.ts`).
- **Simple entry points** (`SimplestApp.tsx`, `SimpleApp.tsx`) for quick demos.

## Demos and media
- Short demo clip: add your link here
- Screenshots: add images in `assets/` and reference them below

```
assets/
  icon.png
  splash-icon.png
```

## Contact
- If you’d like a quick tour or technical deep‑dive, feel free to reach out.
