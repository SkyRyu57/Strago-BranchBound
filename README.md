# Strago (Strategic Go)

**Strago** is a modern, browser-based implementation of the board game **Go**, built with React. It features a clean interface, AI-powered opponents using the Stockfish engine, and a robust match management system.

## Features

- **Modern UI**: A sleek, dark-themed interface with smooth animations.
- **AI Opponents**: Play against Stockfish with adjustable difficulty levels (Novice, Intermediate, Advanced, Master).
- **Match Management**:
  - Create matches with custom board sizes (9x9, 13x13, 19x19).
  - Configure handicap stones and komi.
  - Track game history and statistics.
- **Multiplayer (Local)**: Hot-seat mode for two human players.
- **Game Rules**: Full implementation of Go rules including passing, resignation, and score calculation (Area Scoring).
- **Real-time Analysis**: View engine analysis for captured stones and game score.
- **Responsive Design**: Playable on both desktop and mobile devices.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Strago-BranchBound
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Project Structure

- `src/`: Source code for the application.
- `src/components/`: React components (Board, Card, MatchDetail, etc.).
- `src/assets/`: Static assets (images, JSON data).
- `src/services/`: Business logic and API interactions (MatchService, EngineService).
- `src/pages/`: Main pages of the application (HomePage, Dashboard, CreateMatchPage, etc.).

## Technologies Used

- **React**: UI library
- **React Router**: Navigation
- **Tailwind CSS**: Styling
- **Stockfish**: AI engine (loaded via WebAssembly)
- **Material UI**: Additional UI components and icons

## Usage

1. **Home Page**: Click "Start Playing" to begin.
2. **Dashboard**: View your current matches and statistics.
3. **Create Match**: Configure a new game with your desired settings.
4. **Play**: Click on the board to place stones. The AI will play automatically when enabled.

## License

This project is proprietary. All rights reserved.