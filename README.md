# 🎨 Social App Frontend Client

Frontend client cho ứng dụng mạng xã hội, được xây dựng với React, Redux Toolkit, và Tailwind CSS.

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the App](#-running-the-app)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Environment Variables](#-environment-variables)
- [Build & Deployment](#-build--deployment)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Tech Stack

- **Framework**: React 19.x
- **State Management**: Redux Toolkit (RTK Query)
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React, Heroicons
- **Real-time**: Socket.io Client
- **Notifications**: Sonner, React Hot Toast
- **Build Tool**: Create React App (react-scripts)

## 📋 Prerequisites

- Node.js v18+
- npm hoặc yarn
- Backend server đang chạy (xem [server README](../sever/README.md))

## 🔧 Installation

### 1. Clone repo và cd vào client

```bash
git clone <repo-url>
cd client
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Tạo file `.env`

Tạo file `.env` trong thư mục `client/` với nội dung:

```env
REACT_APP_SERVER_URL = 5000
```

**Lưu ý**: Với Create React App, tất cả biến môi trường phải bắt đầu bằng `REACT_APP_`

## 🏃 Running the App

### Development

```bash
npm start
```

App sẽ chạy tại [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
```

Build files sẽ được tạo trong thư mục `build/`

### Test

```bash
npm test
```

## 📁 Project Structure

```
client/
├── public/                 # Static files
│   ├── images/            # Images assets
│   └── index.html         # HTML template
├── src/
│   ├── app/               # Redux store configuration
│   │   └── store/
│   ├── components/        # Reusable components
│   │   ├── common/        # Common components
│   │   │   └── skeletons/ # Loading skeletons
│   │   └── layouts/       # Layout components
│   ├── contexts/          # React contexts
│   ├── features/          # Feature-based modules
│   │   ├── auth/          # Authentication
│   │   │   ├── api/       # RTK Query APIs
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── chat/          # Chat features
│   │   ├── comment/       # Comments
│   │   ├── notification/  # Notifications
│   │   ├── post/          # Posts
│   │   ├── profile/       # User profiles
│   │   ├── reaction/      # Reactions/Likes
│   │   ├── repost/        # Reposts
│   │   └── search/        # Search
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin pages
│   │   └── user/          # User pages
│   ├── routes/            # Route configurations
│   ├── services/          # API & Socket services
│   ├── styles/            # Global styles
│   ├── utils/             # Utility functions
│   ├── App.js             # Main App component
│   └── index.js           # Entry point
├── tailwind.config.js     # Tailwind configuration
└── package.json
```

## ✨ Features

### Authentication
- Đăng ký/Đăng nhập với email/phone + OTP
- Facebook OAuth login
- JWT authentication với refresh token
- Protected routes
- Auto token refresh

### Posts
- Tạo, chỉnh sửa, xóa posts
- Upload media (images/videos) qua Cloudinary
- View posts với pagination
- Post interactions (like, comment, repost, save)
- Post detail modal
- Post grid view (profile)

### Comments
- Comment on posts
- Reply to comments
- View comments modal
- Real-time comment updates

### Reactions
- Like posts/comments
- View likes modal
- Real-time reaction updates

### Reposts
- Repost posts
- View original post in repost frame
- Interact with original post

### Chat
- Real-time messaging
- Group conversations
- Typing indicators
- Message status (sent, delivered, read)
- Message editing & deletion
- Pinned messages
- Reply to messages
- Media sharing

### Profile
- View user profiles
- Edit profile
- Follow/Unfollow users
- View followers/following
- Privacy settings
- View user posts/reposts/saved posts

### Notifications
- Real-time notifications
- Notification center
- Notification toasts
- Mark as read

### Search
- Search users
- Search history
- Recent searches

### Other Features
- Responsive design (mobile-first)
- Dark mode support (if implemented)
- Loading states & skeletons
- Error handling
- Optimistic updates

## 🔌 Environment Variables

### Required

- `REACT_APP_SERVER_URL` - Backend API URL (default: `http://localhost:5000`)

### Example

```env
REACT_APP_SERVER_URL=http://localhost:5000
```

## 🚀 Build & Deployment

### Build for Production

```bash
npm run build
```

Build files sẽ được tạo trong thư mục `build/` và có thể deploy lên bất kỳ static hosting nào.

### Deploy lên Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts

Hoặc connect GitHub repository trực tiếp trên Vercel dashboard.

### Deploy lên Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Build: `npm run build`
3. Deploy: `netlify deploy --prod --dir=build`

### Deploy lên GitHub Pages

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/social-app",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
3. Deploy: `npm run deploy`

### Environment Variables trong Production

Đảm bảo set environment variables trên hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment
- Render: Environment tab

## 📝 Additional Notes

- **State Management**: Sử dụng Redux Toolkit với RTK Query cho API calls
- **Real-time**: Socket.io client được khởi tạo trong `useSocket` hook
- **Routing**: Protected routes được xử lý bởi `ProtectedRoute` component
- **Styling**: Tailwind CSS với custom configuration
- **API**: Tất cả API calls được quản lý qua RTK Query trong `features/*/api/`
- **Responsive**: Mobile-first design với breakpoints cho tablet và desktop

## 🧪 Testing

```bash
npm test
```

Chạy tests trong watch mode. Xem thêm [Create React App testing docs](https://create-react-app.dev/docs/running-tests/).

## 🤝 Contributing

1. Fork repo
2. Tạo branch mới: `git checkout -b feature/your-feature`
3. Commit thay đổi: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Tạo Pull Request

## 📄 License

ISC

