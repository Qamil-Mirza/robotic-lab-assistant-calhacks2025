# Lab Automation Dashboard

A modern web interface for monitoring molecular biology samples and managing Unitree G1 robot tasks in laboratory automation workflows.

## Features

### Sample Tracking Dashboard
- Real-time sample monitoring with detailed status cards
- 8-stage protocol phase visualization:
  - PCR → Gel → Zymo → Assembly → Transformation → Picking → Miniprep → Sequence
- Visual progress indicators with color-coded status (completed, active, pending, failed)
- Storage location tracking
- Last updated timestamps

### Robot Task Queue
- Create, view, and manage robot movement tasks
- Priority-based task system (urgent/normal/low)
- Task status tracking (queued/in progress/completed/failed)
- Estimated duration display
- Cancel queued tasks
- Real-time task updates

### Robot Status Panel
- Live connection status indicator
- Current robot activity monitoring
- Emergency stop functionality with confirmation dialog

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Formatting**: date-fns

## Project Structure

```
dashboard/
├── app/
│   ├── api/              # API routes
│   │   ├── samples/      # Sample endpoints
│   │   ├── tasks/        # Task management endpoints
│   │   └── robot/        # Robot status endpoint
│   ├── globals.css       # Global styles with theme config
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main dashboard page
├── components/           # React components
│   ├── ui/               # shadcn/ui components
│   ├── protocol-phase-stepper.tsx
│   ├── sample-card.tsx
│   ├── task-queue.tsx
│   └── robot-status.tsx
├── lib/
│   ├── mock-data.ts      # Mock data for development
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## API Endpoints

### Samples
- `GET /api/samples` - Fetch all samples
- `GET /api/samples/[id]` - Fetch specific sample details

### Tasks
- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Create new task
  ```json
  {
    "sampleId": "PCR-2025-001",
    "source": "Bench A",
    "destination": "Bench B",
    "priority": "urgent"
  }
  ```
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Cancel/delete task

### Robot Status
- `GET /api/robot/status` - Fetch current robot status

## Configuration

### Theme Customization

The dashboard uses Perplexity-inspired design with teal accent color (#21808D). To customize:

Edit `app/globals.css`:
```css
--primary: oklch(0.53 0.1 200); /* Teal color */
```

### Mock Data

Currently uses static mock data in `lib/mock-data.ts`. To connect to a real backend:

1. Replace API route implementations in `app/api/`
2. Add environment variables for backend URLs
3. Implement WebSocket connections for real-time updates

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Configure environment variables (if needed)
4. Deploy

The dashboard is optimized for Vercel's platform with automatic edge deployment.

## Future Enhancements

- [ ] WebSocket integration for real-time updates
- [ ] ROS2/DDS backend integration for actual robot control
- [ ] Batch task operations
- [ ] Task dependency management
- [ ] Storage location map visualization
- [ ] Protocol phase metrics and analytics
- [ ] User authentication and authorization
- [ ] Multi-robot support
- [ ] Task scheduling and automation
- [ ] Export data to CSV/JSON

## Contributing

This is a hackathon project. Feel free to fork and enhance!

## License

MIT
