![Z3C Logo](src/app/favicon.ico)

# Z3C - Your AI Wrapper

Z3C is a modern AI chat application that provides a unified interface for multiple AI models. Built with Next.js and TypeScript, it offers a seamless chat experience with various AI providers while maintaining user privacy and providing advanced features.

## 🚀 Features

### Core Features
- **Multi-Model Support**: Integrate with multiple AI providers (OpenAI, Anthropic, Groq, Replicate, OpenRouter, and more)
- **Real-time Chat**: Interactive chat interface with real-time message streaming
- **User Authentication**: Secure user registration and login system
- **Conversation Management**: Create, edit, share, and fork conversations
- **Message History**: Persistent chat history with full conversation tracking
- **File Attachments**: Upload and share files in conversations
- **Model Switching**: Switch between different AI models mid-conversation

### Advanced Features
- **Z3Cs Library**: Create and manage reusable AI components
- **API Key Management**: Bring your own API keys for different AI providers
- **Usage Tracking**: Monitor your API usage and costs
- **Internationalization**: Multi-language support (English, Turkish)
- **Theme Support**: Light, dark, and pixel themes
- **Conversation Sharing**: Share conversations publicly with voting system
- **Prompt Enhancement**: AI-powered prompt optimization
- **Rate Limiting**: Built-in rate limiting for API protection

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (with App Router)
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: SWR
- **Animation**: Framer Motion
- **Icons**: Radix UI, Remix Icons, HugeIcons

### Backend
- **Runtime**: Edge & Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Better Auth
- **AI Integration**: Vercel AI SDK
- **File Storage**: Vercel Blob
- **Caching**: Upstash Redis & KV
- **Rate Limiting**: Upstash Rate Limit

### AI Providers
- OpenAI (GPT models)
- Anthropic (Claude models)
- Google (Gemini models)
- Groq (Fast inference)
- Replicate (Image generation)
- OpenRouter (Multi-provider access)
- DeepSeek, Mistral, xAI, and more

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ or Bun
- MongoDB database
- Git

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/z3cdotdev/chat.git
   cd z3c
   ```

2. **Install dependencies**
   ```bash
   # Using bun (recommended)
   bun install
   
   # Or using npm
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory and add the following variables:
   
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # Authentication
   BETTER_AUTH_SECRET=your_secret_key
   BETTER_AUTH_URL=http://localhost:3000
   
   # AI Provider API Keys
   Z3_OPENROUTER_API_KEY=your_openrouter_api_key
   Z3_REPLICATE_API_KEY=your_replicate_api_key
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   
   # Vercel Services (optional)
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   KV_REST_API_URL=your_upstash_kv_url
   KV_REST_API_TOKEN=your_upstash_kv_token
   
   # Redis (optional)
   REDIS_URL=your_redis_url
   ```

4. **Database Setup**
   
   Import the AI models configuration to your MongoDB:
   ```bash
   # Make sure your MongoDB is running and accessible
   # Import the z3-chat.agentmodels.json to your 'agentmodels' collection
   mongoimport --db your_database_name --collection agentmodels --file z3-chat.agentmodels.json
   ```

5. **Seed the database** (optional)
   ```bash
   bun run seed
   ```

6. **Start the development server**
   ```bash
   bun run dev
   ```

   The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
z3-chat/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (pages)/           # Page routes
│   │   ├── api/               # API routes
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   │   ├── chat-ui/          # Chat interface components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   └── ui/               # UI components
│   ├── contexts/             # React contexts
│   ├── database/             # Database models and connection
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   ├── stores/               # Zustand stores
│   └── middleware/           # Next.js middleware
├── public/                   # Static assets
├── z3-chat.agentmodels.json # AI models configuration
└── z3c.config.json          # Application configuration
```

## 🔧 Configuration

### AI Models Configuration
The application uses a MongoDB collection to store AI model configurations. Each model entry includes:
- Model ID and name
- Provider information
- Capabilities (text, image, code)
- Pricing information
- Rate limits

### User API Keys
Users can add their own API keys for different providers through the settings panel, allowing them to:
- Use their own quotas
- Access premium models
- Avoid rate limits

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Docker
```bash
# Build the Docker image
docker build -t z3-chat .

# Run the container
docker run -p 3000:3000 --env-file .env.local z3-chat
```

## 📖 API Documentation

The application provides RESTful APIs for:

### Conversations
- `GET /api/v1/conversations` - Get user conversations
- `POST /api/v1/create-conversation` - Create new conversation
- `GET /api/v1/conversation/[id]` - Get conversation details
- `DELETE /api/v1/conversation/[id]/delete` - Delete conversation

### Models
- `GET /api/v1/models` - Get available AI models
- `GET /api/v1/models/all` - Get all models with details

### User Management
- `GET /api/v1/user/details` - Get user profile
- `POST /api/v1/user/api-keys` - Manage user API keys

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [https://chat.z3c.dev](https://chat.z3c.dev)
- **Documentation**: Coming soon
- **GitHub**: [Repository Link]
- **Issues**: [Report Issues]

## 💬 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Email: support@z3c.dev

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai/) for AI integration
- [Next.js](https://nextjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- All the AI providers for their APIs
- The open-source community for amazing packages

---

**Z3C** - Bringing multiple AI models together in one beautiful interface.
