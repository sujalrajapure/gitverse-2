# GitVerse

GitVerse is a comprehensive GitHub repository analytics dashboard that provides deep insights into repository health, contributor activity, and project trends using AI-powered analysis. Built with Next.js, TypeScript, and integrated with Google Gemini AI for intelligent summaries and predictions.

## 🚀 Features

- **Repository Analytics Dashboard**: Comprehensive overview of GitHub repositories with real-time data
- **AI-Powered Insights**: Intelligent summaries and health analysis using Google Gemini AI
- **Interactive Charts**: Visual representations of contributors, issues, pull requests, and activity patterns
- **Health Score Analysis**: Automated repository health assessment with detailed metrics
- **Activity Predictions**: AI-driven predictions for future repository activity and growth
- **PDF Reports**: Generate and download detailed repository reports
- **GitHub OAuth Integration**: Secure authentication with GitHub for enhanced data access
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS and shadcn/ui

## 🏗️ Architecture

### Frontend Architecture

```
app/
├── layout.tsx              # Root layout with theme provider
├── page.tsx                # Landing page with repository URL input
├── globals.css             # Global styles and Tailwind imports
├── dashboard/
│   └── [owner]/
│       └── [repo]/
│           └── page.tsx    # Main dashboard page with analytics
├── login/
│   └── page.tsx            # GitHub OAuth login page
├── profile/
│   └── page.tsx            # User profile page
└── api/                    # API routes (see Backend Architecture)
```

### Backend Architecture (API Routes)

```
app/api/
├── auth/
│   ├── callback/
│   │   └── github/
│   │       └── route.ts    # GitHub OAuth callback handler
│   ├── github/
│   │   └── route.ts        # GitHub OAuth initiation
│   └── logout/
│       └── route.ts        # User logout handler
├── gemini/
│   ├── route.ts            # AI-powered repository summary generation
│   ├── health/
│   │   └── route.ts        # Repository health score analysis
│   └── prediction/
│       └── route.ts        # Future activity predictions
└── github/
    ├── contributors/
    │   └── route.ts        # Fetch repository contributors
    ├── graphql/
    │   └── route.ts        # GitHub GraphQL API queries
    ├── issues/
    │   └── route.ts        # Fetch repository issues
    ├── pull-requests/
    │   └── route.ts        # Fetch pull requests
    ├── repo/
    │   └── route.ts        # Fetch repository metadata
    └── user/
        └── repos/
            └── route.ts    # Fetch user repositories
```

### Component Architecture

```
components/
├── ui/                     # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── chart.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── tabs.tsx
│   └── ... (other UI components)
├── charts.tsx              # Custom chart components
│   ├── ContributorsChart
│   ├── IssuesChart
│   ├── PullRequestsChart
│   ├── ActivityHeatmap
│   ├── HealthScoreChart
│   ├── StarGrowthChart
│   └── PredictedActivityChart
└── theme-provider.tsx      # Theme context provider
```

### Utility Architecture

```
lib/
├── gemini-api.ts           # Google Gemini AI integration utilities
├── pdf-generator.ts        # PDF report generation utilities
└── utils.ts                # General utility functions

hooks/
├── use-mobile.tsx          # Mobile device detection hook
└── use-toast.ts            # Toast notification hook

models/
├── data.csv                # Sample data for development
└── health.py               # Health analysis model (Python script)
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS variables
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Next.js API Routes (Node.js)
- **Authentication**: GitHub OAuth 2.0
- **AI Integration**: Google Generative AI (Gemini)
- **External APIs**: GitHub REST API, GitHub GraphQL API

### Development Tools
- **Package Manager**: pnpm
- **Build Tool**: Next.js built-in
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **CSS Processing**: PostCSS with Autoprefixer

### Key Dependencies
- `@google/generative-ai`: Google Gemini AI integration
- `jspdf` & `jspdf-autotable`: PDF generation
- `react-hook-form` & `@hookform/resolvers`: Form handling
- `zod`: Schema validation
- `next-themes`: Theme management
- `date-fns`: Date utilities
- `class-variance-authority`: Component variant utilities

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm package manager
- GitHub account (for OAuth)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/gitverse.git
   cd gitverse
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # GitHub OAuth (get from GitHub Developer Settings)
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret

   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key

   # Optional: GitHub Token for increased API limits
   GITHUB_TOKEN=your_github_personal_access_token
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Basic Workflow

1. **Landing Page**: Enter a GitHub repository URL (e.g., `https://github.com/microsoft/vscode`)
2. **Authentication**: Log in with GitHub OAuth for enhanced data access
3. **Dashboard**: View comprehensive analytics including:
   - Repository overview and metadata
   - Contributor statistics and charts
   - Issues and pull request analysis
   - Activity heatmaps
   - AI-generated summaries and health scores
   - Future activity predictions
4. **Reports**: Generate and download PDF reports of the analysis

### API Endpoints

#### GitHub Data Endpoints
- `GET /api/github/repo?owner={owner}&repo={repo}` - Repository metadata
- `GET /api/github/contributors?owner={owner}&repo={repo}` - Contributor data
- `GET /api/github/issues?owner={owner}&repo={repo}` - Issues data
- `GET /api/github/pull-requests?owner={owner}&repo={repo}` - Pull requests data

#### AI Analysis Endpoints
- `POST /api/gemini` - Generate repository summary
- `POST /api/gemini/health` - Calculate health score
- `POST /api/gemini/prediction` - Generate predictions

#### Authentication Endpoints
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/callback/github` - OAuth callback
- `POST /api/auth/logout` - User logout

## 🔧 Configuration

### GitHub OAuth Setup
1. Go to GitHub Developer Settings
2. Create a new OAuth App
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`
4. Add Client ID and Secret to environment variables

### Google Gemini Setup
1. Visit Google AI Studio
2. Create a new API key
3. Add the key to `GEMINI_API_KEY` environment variable

### Environment Variables
```env
# Required
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GEMINI_API_KEY=your_gemini_api_key

# Optional
GITHUB_TOKEN=your_github_token  # Increases API rate limits
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For production deployments
```

## 📊 Data Flow

1. **User Input**: Repository URL entered on landing page
2. **Authentication**: GitHub OAuth for enhanced API access
3. **Data Fetching**: Parallel API calls to GitHub REST and GraphQL APIs
4. **AI Processing**: Data sent to Google Gemini for analysis and predictions
5. **Visualization**: Charts and metrics rendered using Recharts
6. **Report Generation**: PDF created using jsPDF with analysis data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing component patterns
- Add proper error handling
- Update documentation for new features
- Test API integrations thoroughly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Google Gemini AI](https://ai.google.dev/) for AI-powered insights
- [GitHub API](https://docs.github.com/en/rest) for repository data
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ using Next.js, TypeScript, and AI-powered analytics</content>
<parameter name="filePath">c:\Users\sujal\Desktop\gitverse 2\README.md
