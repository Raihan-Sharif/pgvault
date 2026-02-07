# 🗄️ PGVault

**Professional PostgreSQL backup & restore tool with real-time console progress, GZIP compression, and beautiful UI.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/pgvault)

![PGVault Screenshot](./screenshots/dark-mode.png)

## ✨ Features

- **Complete Backups** - Tables, views, functions, triggers, constraints & more
- **Real-time Progress** - Console-like live output with animated status indicators
- **GZIP Compression** - Reduce backup size by up to 90%
- **One-Click Restore** - Easy database recovery with progress tracking
- **Beautiful UI** - Premium glassmorphism design with dark/light modes
- **Backup History** - Browse, download, and manage your backups

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- pnpm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pgvault.git
cd pgvault

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Usage

### Creating a Backup

1. Enter your PostgreSQL connection string
2. Provide a name for your backup
3. Enable compression (recommended)
4. Click "Create Backup"

### Restoring a Backup

1. Switch to the "Restore" tab
2. Enter target database connection string
3. Select a backup from the list
4. Choose whether to clean the database first
5. Click "Restore Database"

### Managing Backups

- View all backups in the "History" tab
- Download backups for external storage
- Delete old backups to free up space

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Database**: PostgreSQL (pg driver)

## 📁 Project Structure

```
pgvault/
├── app/
│   ├── api/           # API routes (backup, restore, etc.)
│   ├── globals.css    # Global styles & design system
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page
├── components/
│   ├── BackupTab.tsx  # Backup creation UI
│   ├── RestoreTab.tsx # Database restore UI
│   ├── HistoryTab.tsx # Backup history list
│   └── theme-toggle.tsx
├── lib/
│   ├── types.ts       # TypeScript interfaces
│   └── utils.ts       # Utility functions
└── backups/           # Backup storage directory
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in Vercel
3. Deploy!

The app will be available at `your-repo-name.vercel.app`

> **Note**: For production, consider using external storage (S3, R2) for backups.

## 🔒 Security

- Connection strings are never stored
- All data is transmitted securely
- Backups are stored locally on the server

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

<p align="center">
  Built with ❤️ using Next.js & TypeScript
</p>
