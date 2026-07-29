// README.md
# Hospital Nurse Roster System

A comprehensive web application for managing hospital nurse rosters with automated scheduling, workload balancing, and shift management.

## Features

- **Dashboard**: Overview of nurses, shifts, and monthly statistics
- **Nurse Management**: Add, edit, and manage nurse profiles
- **Automated Roster Generation**: Smart scheduling with workload balancing
- **Shift Management**: Morning and night shift assignments
- **Workload Analytics**: Visual charts showing work distribution
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18
- **Charts**: Recharts
- **Icons**: Lucide React
- **Styling**: CSS-in-JS (inline styles)
- **Code Quality**: ESLint, Prettier

## Project Structure

```
src/
├── components/
│   ├── Dashboard/          # Dashboard components
│   ├── NurseManagement/    # Nurse CRUD operations
│   ├── Roster/            # Roster view and generation
│   ├── Settings/          # Configuration settings
│   ├── Layout/            # Header and navigation
│   └── Common/            # Reusable components
├── hooks/                 # Custom React hooks
├── services/              # Business logic
├── constants/             # Configuration and data
├── utils/                 # Helper functions
└── styles/                # Global styles
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Build for Production

```bash
npm run build
```

## Key Features Explained

### Roster Generation Algorithm
- Balances workload across all nurses
- Respects shift duration and off-duty requirements
- Prioritizes fair distribution of morning and night shifts
- Handles nurse availability and status

### Nurse Management
- Add/edit/delete nurses
- Manage qualifications (RN, MW, RN-MW)
- Track experience levels and departments
- Status management (active, disabled, archived)

### Dashboard Analytics
- Visual charts showing work distribution
- Monthly calendar view
- Statistics cards
- Real-time roster overview

## Configuration

The system allows configuration of:
- Shift sizes (morning/night)
- Shift durations
- Off-duty periods
- Minimum qualification requirements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

EGWIAPP License - see LICENSE file for details