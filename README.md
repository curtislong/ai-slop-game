# AI Slop: The Game! 🎨🤖

A hilarious multiplayer prompt telephone game where AI-generated images drift into absurdity.

## How to Play

1. **First player** fills in a mad lib prompt
2. **AI generates** an image from that prompt
3. **Next player** sees only the image and guesses what the prompt was
4. **AI generates** an image from their guess
5. **Repeat** until everyone has taken a turn
6. **Watch the replay** to see how hilariously the prompt evolved!

## Local Development

### Prerequisites

- Node.js 18+
- npm or pnpm

### Setup

1. Clone the repo:
```bash
git clone https://github.com/curtislong/ai-slop-game.git
cd ai-slop-game
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Set up FAL API key:
```bash
cp .env.local.example .env.local
# Edit .env.local and add your FAL API key from https://fal.ai/dashboard/keys
```

If you don't set up a FAL API key, the game will use mock images (random placeholders) for testing.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **FAL AI (FLUX Schnell)** - Image generation (~$0.005-0.01 per image)
- **React Context** - State management

## Architecture

```
ai-slop-game/
├── app/
│   ├── layout.tsx          # Root layout with GameProvider
│   ├── page.tsx            # Main game orchestrator
│   └── globals.css         # Global styles
├── components/
│   ├── GameSetup.tsx       # Player setup screen
│   ├── MadLibTurn.tsx      # First player: fill mad lib
│   ├── GuessTurn.tsx       # Other players: guess prompt
│   └── ReplayView.tsx      # Game replay
├── context/
│   └── GameContext.tsx     # Global game state
├── lib/
│   ├── cards.ts            # Mad lib card deck
│   ├── gameLogic.ts        # Game rules & utilities
│   └── fal-client.ts       # FAL API wrapper
└── types/
    └── game.ts             # TypeScript types
```

## Game Modes (Future)

- [x] Single-device pass-and-play
- [ ] Multi-device async play
- [ ] Turn timers
- [ ] Multiple card decks/themes
- [ ] Replay export as comic strip

## Cost Estimates

- **Development**: Free (your time)
- **Hosting**: Free (Vercel)
- **Images**: ~$0.005-0.01 per generation
  - 10 friends × 5 games = ~$0.25-0.50
  - Heavy use (100 games/month) = ~$5-10

Set spending limits on your FAL dashboard to avoid surprises!

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/curtislong/ai-slop-game)

Remember to add your `NEXT_PUBLIC_FAL_API_KEY` in Vercel's environment variables.

## Contributing

This is a fun side project! Feel free to fork and make it your own.

## License

MIT - Do whatever you want with it!

---

Built with vibe-coding and Claude Code 🤖
