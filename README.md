# Taleon - Multi-Tenant Blog SaaS Platform

Taleon is a comprehensive SaaS platform that empowers bloggers and content creators to launch and manage professional blogs without the technical complexities of infrastructure, hosting, or SEO optimization. Built with a multi-tenant architecture, Taleon provides a complete blogging ecosystem including user authentication, rich content editing, SEO-optimized public pages, and performance monitoring.

## Overview

Bloggers and content creators often struggle with technical setup when building blogs. Taleon solves this by abstracting complex infrastructure concerns, offering a SaaS experience similar to Medium or Hashnode but with complete ownership and customization. Users can focus solely on creating content while Taleon handles the technology.

### Key Benefits
- **Zero Technical Setup**: Launch a blog in minutes without coding knowledge
- **Multi-Tenant Architecture**: Complete data isolation between blogs
- **SEO-Optimized**: Automatic meta tags, server-side rendering, and semantic HTML
- **Rich Content Editing**: Intuitive editor with formatting, images, and structured content
- **Analytics Dashboard**: Monitor blog performance and visitor statistics
- **Responsive Design**: Mobile-first approach with progressive enhancement

## Technology Stack

### Frontend (This Repository)
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Typography plugin
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Authentication**: JWT-based with HTTP-only cookies
- **Testing**: Vitest with Testing Library
- **Linting/Formatting**: Biome
- **Build Tool**: Turbopack (Next.js)

### Backend (Separate Repository)
- **Framework**: NestJS with REST API
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt password hashing
- **File Storage**: Local (dev) / Cloud (AWS S3/Cloudinary for prod)
- **Documentation**: Swagger/OpenAPI

### Infrastructure
- **Frontend Deployment**: Vercel
- **Backend Deployment**: Railway/Render
- **Database**: MongoDB Atlas
- **Monitoring**: Sentry (errors), Vercel Analytics
- **CI/CD**: GitHub Actions

## Features

### MVP Features (Must-Have)
- ✅ **User Authentication**: Secure registration/login with JWT tokens
- ✅ **Multi-Tenant Blogs**: Isolated blog instances with unique URLs (`taleon.com/{blog-slug}`)
- ✅ **Rich Text Editor**: TipTap-based editor with formatting, lists, links, and images
- ✅ **Blog Post CRUD**: Create, read, update, delete posts with draft/published states
- ✅ **SEO Optimization**: Server-side rendering, dynamic meta tags, semantic HTML
- ✅ **Public Blog Interface**: Responsive, fast-loading pages for readers
- ✅ **Dashboard**: Post management, basic analytics, blog settings
- ✅ **Responsive Design**: Mobile-first with progressive enhancement

### Post-MVP Features (Should-Have)
- 🔄 **Image Optimization**: CDN integration and automatic resizing
- 🔄 **Advanced Analytics**: Detailed visitor statistics and performance metrics
- 🔄 **Email Newsletter**: Integration with email service providers
- 🔄 **Social Sharing**: Share buttons and Open Graph tags
- 🔄 **Comment System**: Reader engagement features
- 🔄 **Search Functionality**: Full-text search across posts

### Future Features (Could-Have)
- 🔄 **Team Collaboration**: Multiple authors with permission management
- 🔄 **Custom Domains**: DNS management and SSL certificates
- 🔄 **Monetization**: Premium features and subscription models
- 🔄 **API Integration**: Third-party integrations and webhooks
- 🔄 **Advanced Theming**: Custom themes and branding options

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Public Users  │────│   Next.js App   │────│   NestJS API    │
│                 │    │   (Frontend)    │    │   (Backend)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Vercel        │    │   MongoDB       │
                       │   (Deployment)  │    │   (Database)    │
                       └─────────────────┘    └─────────────────┘
```

### Architecture Components

#### Frontend Layer (Next.js)
- **App Router**: Server components for public pages, client components for dashboard
- **Server-Side Rendering**: SEO-optimized public blog pages
- **API Routes**: Client-side data fetching with TanStack Query
- **Middleware**: Authentication guards and tenant routing

#### Backend Layer (NestJS)
- **Modular Architecture**: Separate modules for auth, posts, tenants, users
- **JWT Authentication**: Secure token-based authentication
- **Multi-Tenancy**: Database-level isolation with tenantId references
- **File Upload**: Image handling with validation and optimization

#### Data Layer (MongoDB)
- **Collections**: users, tenants, posts, sessions
- **Indexing**: Optimized queries for performance
- **Isolation**: Tenant-specific data separation

#### Deployment Architecture
- **Frontend**: Vercel for global CDN and serverless functions
- **Backend**: Railway/Render for containerized API deployment
- **Database**: MongoDB Atlas with automated backups
- **Monitoring**: Integrated error tracking and analytics

## Project Structure

```
frontend-taleon/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx        # Dashboard layout
│   │   │       └── page.tsx          # Dashboard home
│   │   ├── [tenantSlug]/             # Dynamic tenant routes
│   │   │   ├── page.tsx              # Public blog home
│   │   │   └── [postSlug]/
│   │   │       └── page.tsx          # Individual post pages
│   │   ├── login/                    # Authentication pages
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   └── globals.css               # Global styles
│   ├── components/                   # Reusable components
│   │   ├── LoginForm.tsx             # Authentication forms
│   │   ├── RegisterForm.tsx
│   │   └── __tests__/                # Component tests
│   ├── lib/                          # Utility libraries
│   │   ├── auth.ts                   # Authentication helpers
│   │   ├── api-client.ts             # API communication
│   │   └── seo.ts                    # SEO utilities
│   └── test/                         # Test setup
│       └── setup.ts
├── public/                           # Static assets
├── .github/                          # GitHub Actions
├── biome.json                        # Linting config
├── next.config.ts                    # Next.js config
├── package.json                      # Dependencies
├── tailwind.config.mjs               # Tailwind config
├── tsconfig.json                     # TypeScript config
├── vitest.config.ts                  # Testing config
└── README.md                         # This file
```

## Milestones

### Phase 1: Foundation (Week 1-2)
- [x] Project setup with Next.js and TypeScript
- [x] Basic routing and layouts
- [x] Authentication UI components
- [x] Database schema design

### Phase 2: Core Features (Week 3-4)
- [x] User registration and login
- [x] Multi-tenant blog creation
- [x] Rich text editor integration
- [x] Blog post CRUD operations

### Phase 3: Public Interface (Week 5-6)
- [x] SEO-optimized public pages
- [x] Responsive design implementation
- [x] Dashboard with analytics
- [x] Performance optimization

### Phase 4: Polish & Testing (Week 7-8)
- [x] Comprehensive testing (>80% coverage)
- [x] Security audit and fixes
- [x] Performance optimization
- [x] Documentation and deployment

## Prerequisites

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **MongoDB**: Local instance for development (optional, can use Atlas)

## Getting Started

### Cloning the Repository

```bash
# Clone the frontend repository
git clone https://github.com/your-org/taleon-frontend.git
cd taleon-frontend

# Clone the backend repository (separate)
git clone https://github.com/your-org/taleon-backend.git
cd ../taleon-backend
# Follow backend setup instructions
```

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies (in separate terminal)
cd ../taleon-backend
npm install
```

### Environment Setup

Create `.env.local` files in both repositories:

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Backend (.env.local):**
```env
MONGODB_URI=mongodb://localhost:27017/taleon
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Running the Application

```bash
# Start the backend (in one terminal)
cd taleon-backend
npm run dev

# Start the frontend (in another terminal)
cd taleon-frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run preview      # Preview production build

# Quality Assurance
npm run lint         # Run Biome linter
npm run format       # Format code with Biome
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI

# Maintenance
npm run type-check   # Run TypeScript type checking
npm run clean        # Clean build artifacts
```

## Deployment

### Frontend Deployment (Vercel)

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Environment Variables**: Set production environment variables
3. **Build Settings**: Configure build command and output directory
4. **Deploy**: Automatic deployments on push to main branch

**Deployment URL**: [https://taleon.vercel.app](https://taleon.vercel.app)

### Backend Deployment (Railway)

1. **Connect Repository**: Link backend repo to Railway
2. **Environment Variables**: Configure production database and secrets
3. **Database**: Set up MongoDB Atlas connection
4. **Deploy**: Automatic deployments with health checks

**API URL**: [https://taleon-api.railway.app](https://taleon-api.railway.app)

## Testing

### Test Coverage

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint and database interaction testing
- **End-to-End Tests**: Complete user workflow testing
- **Performance Tests**: Lighthouse audits and load testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- LoginForm.test.tsx

# Run tests in watch mode
npm run test:watch
```

### Test Structure

```
src/
├── components/
│   └── __tests__/
│       ├── LoginForm.test.tsx
│       └── RegisterForm.test.tsx
├── lib/
│   └── __tests__/
│       ├── auth.test.ts
│       └── api-client.test.ts
└── app/
    └── __tests__/
        └── page.test.tsx
```

## Feature Trade-Offs

### Authentication Complexity
**Trade-off**: OAuth integrations (Google, GitHub) vs. email/password only
**Decision**: MVP uses email/password for simplicity. OAuth added post-MVP based on user feedback.
**Rationale**: Reduces development time and complexity for initial launch.

### Real-time Features
**Trade-off**: Real-time collaboration vs. static editing
**Decision**: Static editing for MVP. Real-time features planned for future versions.
**Rationale**: Real-time adds significant infrastructure complexity.

### Advanced Analytics
**Trade-off**: Comprehensive analytics vs. basic metrics
**Decision**: Basic page views and statistics for MVP. Advanced analytics as premium feature.
**Rationale**: Advanced analytics require additional services and data processing.

### Custom Domain Support
**Trade-off**: Custom domains vs. subdomain-only
**Decision**: Subdomain-only for MVP. Custom domains post-MVP.
**Rationale**: Custom domains require DNS management and SSL complexity.

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-org/taleon-frontend.git
   cd taleon-frontend
   git checkout -b feature/your-feature-name
   ```

2. **Set Up Development Environment**
   ```bash
   npm install
   cp .env.example .env.local
   npm run dev
   ```

3. **Make Changes**
   - Follow TypeScript and React best practices
   - Write tests for new features
   - Update documentation as needed
   - Ensure code passes linting and formatting

4. **Testing**
   ```bash
   npm test
   npm run lint
   npm run type-check
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Provide clear description of changes
   - Reference related issues
   - Request review from maintainers

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint/Prettier**: Automated code formatting with Biome
- **Testing**: Minimum 80% test coverage
- **Commits**: Conventional commit format
- **Documentation**: Update README and inline comments

### Issue Reporting

- Use GitHub Issues for bug reports and feature requests
- Provide detailed reproduction steps
- Include browser/OS information
- Attach screenshots for UI issues

## Security

Taleon takes security seriously. Key measures include:

- **Authentication**: JWT with secure HTTP-only cookies
- **Password Security**: bcrypt hashing with salt rounds
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Zod schema validation
- **XSS Protection**: Content sanitization
- **CSRF Protection**: Token-based prevention
- **Data Isolation**: Multi-tenant database separation

## Performance

### Targets
- **First Contentful Paint**: < 1.5 seconds
- **Time to Interactive**: < 3 seconds
- **Lighthouse Score**: > 90 (Performance, SEO, Accessibility)
- **API Response Time**: < 200ms (95th percentile)

### Optimizations
- Server-side rendering for public pages
- Image optimization and lazy loading
- Code splitting and dynamic imports
- Database query optimization
- CDN for static assets

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [https://docs.taleon.com](https://docs.taleon.com)
- **Issues**: [GitHub Issues](https://github.com/your-org/taleon-frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/taleon-frontend/discussions)
- **Email**: support@taleon.com

## Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Vercel**: For hosting and deployment platform
- **MongoDB**: For the flexible document database
- **Tailwind CSS**: For utility-first styling
- **TipTap**: For the rich text editor

## Roadmap

### Version 1.1 (Q2 2024)
- Image optimization and CDN integration
- Advanced analytics dashboard
- Email newsletter integration

### Version 1.2 (Q3 2024)
- Social media sharing features
- Comment system
- Search functionality

### Version 2.0 (Q4 2024)
- Team collaboration features
- Custom domain support
- Monetization options

---

**Built with ❤️ by the Taleon Team**
