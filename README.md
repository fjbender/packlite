# Packlite (Litepack)

Packlite is a modern web application that helps hikers and trekkers efficiently pack for their outdoor adventures. It focuses on weight optimization, gear organization, and sharing capabilities to help users pack only what they need.

## Project Overview

Packlite helps outdoor enthusiasts:
- Manage and organize gear items
- Create and optimize packing lists for trips
- Track and analyze pack weight
- Share packing lists with the community
- Find weight optimization suggestions

## Features

- **Gear Management**: Create, categorize, and track your outdoor equipment
- **Trip Packing Lists**: Build customized lists for different adventures
- **Weight Optimization**: Get insights to lighten your load
- **Social Sharing**: Share and discover packing lists from other users
- **User Accounts**: Track your gear and trips over time

## Tech Stack

- **Frontend**: React with Next.js (v15.3.0)
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Backend**: Next.js API Routes with MongoDB
- **Authentication**: NextAuth.js
- **TypeScript**: For type safety and improved developer experience

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, pnpm, or bun
- MongoDB (local or Atlas connection)

### Development Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the required environment variables.

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Docker Setup

The project includes Docker support for easier development and deployment:

```bash
# Start the containerized application with MongoDB
docker-compose up
```

## Project Structure

- `/src/app`: Next.js app directory containing routes and pages
- `/src/components`: Reusable React components
- `/src/lib`: Utilities, hooks, and business logic
- `/public`: Static assets

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [MongoDB](https://docs.mongodb.com/)
- [NextAuth.js](https://next-auth.js.org/)

## Deployment

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for details on deploying the application.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
