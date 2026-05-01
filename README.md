# Quran Twin — Your Daily Quran Companion

<p align="center">
  <img src="frontend/public/favicon.svg" alt="Quran Twin Logo" width="100" />
</p>

<p align="center">
  <strong>A personalized Quran companion that turns your emotions into meaningful verses</strong>
</p>

---

## About Quran Twin

Quran Twin is a web application that helps users maintain their connection with the Quran beyond Ramadan. Users share how they feel—stressed, grateful, lost, anxious—and the app delivers a personalized verse (ayah) chosen for that moment, complete with Arabic text, translation, and tafsir (commentary).

The app syncs notes to the user's Quran Foundation account and tracks daily streaks to build a lasting spiritual habit.

---

## The Problem

Millions reconnect with the Quran during Ramadan, but many struggle to maintain that connection afterwards. The light fades, the routine breaks, and the Quran starts to feel distant—not because we don't love it, but because life rushes back in.

## Our Solution

Quran Twin addresses this by:

1. **Personalized Verses** — AI selects the perfect ayah for the user's emotional state
2. **Complete Context** — Arabic text, translation, and tafsir for deeper understanding
3. **Reflection Writing** — Users write personal notes tied to each verse
4. **Account Sync** — Notes saved directly to Quran Foundation account
5. **Daily Habit** — Streak tracking builds a consistent spiritual practice

---

## Tech Stack

### Frontend
- **React** + TypeScript
- **Vite** for build tooling
- **Tailwind CSS** + **shadcn/ui** for styling
- **React Router** for navigation
- **Sonner** for toast notifications

### Backend
- **Node.js** + **Express**
- **Prisma** ORM
- **PostgreSQL** database
- **Redis** for rate limiting

### APIs
- **Quran Foundation API** — verses, translations, tafsir
- **Quran Foundation User API** — notes, reflections (Post API)
- **Groq AI** — emotion matching

---

## API Integration

### Content APIs (Quran Foundation)
- ✅ `/api/v4/verses/by_key` — Fetch verses by key
- ✅ `/api/v4/translations` — Fetch translations
- ✅ `/api/v4/tafsirs` — Fetch tafsir

### User APIs (Quran Foundation)  
- ✅ `/auth/v1/notes` — Save/create reflections
- ✅ Streak tracking via PostgreSQL database

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or use hosted database)
- Quran Foundation Developer Account

### Environment Variables

Create `.env` files in both `/backend` and `/frontend`:

#### Backend `.env`
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@host:5432/db"
REDIS_URL=redis://host:6379
QURAN_CLIENT_ID=your_client_id
QURAN_CLIENT_SECRET=your_client_secret
QURAN_REDIRECT_URI=http://localhost:5000/auth/callback
OAUTH_BASE_URL=https://prelive-oauth2.quran.foundation
API_BASE_URL=https://apis-prelive.quran.foundation
QURAN_API_BASE=https://api.quran.com/api/v4
QURAN_NOTES_API=https://apis-prelive.quran.foundation/auth/v1/notes
FRONTEND_URL=http://localhost:3000
GROQ_API_KEY=your_groq_api_key
```

#### Frontend `.env`
```env
VITE_BACKEND_URL=http://localhost:5000
```

### Installation

```bash
# Clone and navigate
cd quran-twin

# Install backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Install frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Running

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

---

## Features Demo Flow

1. **Landing Page** — Beautiful introduction with call-to-action
2. **Login** — OAuth via Quran Foundation
3. **Dashboard** — Enter emotion (e.g., "I feel stressed")
4. **Get Verse** — Personalized ayah + translation + tafsir
5. **Write Note** — Personal reflection (min 6 characters)
6. **Save** — Syncs to Quran account + streak updates
7. **History** — View all saved notes with dates
8. **Streak Badge** — Shows daily streak in navbar

---

## Project Structure

```
quran-twin/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── services/       # Business logic & API calls
│   │   ├── routes/        # Express routes
│   │   └── lib/          # Utilities (logger, prisma, rate limiter)
│   ├── prisma/           # Database schema
│   ├── server.js         # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # API clients & utilities
│   │   ├── context/      # React context (Auth)
│   │   └── hooks/        # Custom hooks
│   ├── public/           # Static assets
│   ├── index.html        # HTML entry
│   └── package.json
│
└── README.md
```

---

## Hackathon Submission

### Judging Criteria Alignment

| Criteria | Points | How We Meet It |
|----------|--------|---------------|
| **Impact on Quran Engagement** | 30 | Personalized verses from emotions, builds daily habit, streak tracking |
| **Product Quality & UX** | 20 | Clean UI, responsive design, shadcn/ui components |
| **Technical Execution** | 20 | Full-stack, TypeScript, Prisma, rate limiting |
| **Innovation & Creativity** | 15 | AI emotion matching, personalized verse selection |
| **Effective Use of APIs** | 15 | Content APIs + User APIs integrated |

### Technical Requirements ✅

- ✅ At least one **Content API** — verses, translations, tafsir
- ✅ At least one **User API** — Post API (notes/reflections), Streak tracking

---

## Future Enhancements

- [ ] Audio recitation playback
- [ ] Bookmarks integration
- [ ] Collections for organizing notes
- [ ] Activity & Goals APIs
- [ ] Daily reminders push notifications
- [ ] Share verses on social media
- [ ] Multi-language support

---

## License

MIT — You retain full ownership of your project.

---

## Author

**Abdul-Quddus**  
Software Developer from Nigeria

- GitHub: [@ghostscript0x](https://github.com/ghostscript0x)

---

## Acknowledgments

- [Quran Foundation](https://quran.foundation) — For the powerful API ecosystem
- [Provision Launch](https://provisioncapital.com) — For organizing this hackathon
- [shadcn/ui](https://ui.shadcn.com) — For the beautiful component library

---

<p align="center">
  Built for the Quran Foundation Hackathon 2026<br />
  © 2026 Abdul-Quddus (@ghostscript0x). All rights reserved.
</p>