# Deployment Guide for Kallakuri Admin Panel

## 🚀 VPS Deployment Instructions

### 1. **Pull the Code on Your VPS**
```bash
git pull origin main
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Build the Production App**
```bash
npm run build
```

### 4. **Environment Configuration**
The project now includes:
- `.env` - Currently configured for live backend (`http://kallakuri.volvrit.org/api`)
- `.env.production` - Production-specific configuration
- `.env.example` - Template with different options

### 5. **Serve the Built App**
You can serve the built app using:

**Option A: Using a simple HTTP server**
```bash
npx serve -s build -l 3000
```

**Option B: Using PM2 (recommended)**
```bash
npm install -g pm2
pm2 serve build 3000 --name "kallakuri-admin"
```

**Option C: Using Nginx (production recommended)**
- Copy the `build` folder contents to your nginx web root
- Configure nginx to serve the files and proxy API calls

---

## 🔧 Live Backend Connection

### **Current Configuration**
✅ **Connected to Live Backend**: `http://kallakuri.volvrit.org/api`

The React app is now configured to connect to your live backend server. The API endpoints available include:
- Authentication: `/auth/login`
- Damage Claims: `/damage-claims`
- Tasks: `/tasks`
- Staff Management: `/staff`
- And many more...

### **API Documentation**
Your live API documentation is available at: [http://kallakuri.volvrit.org/api-docs/](http://kallakuri.volvrit.org/api-docs/)

---

## 🔄 Configuration Options

### For Development (Local Testing)
To test with local backend during development:
```bash
# Edit .env file
REACT_APP_API_URL=http://localhost:3002/api
```

### For Production (Different Server)
To point to a different production server:
```bash
# Edit .env.production file
REACT_APP_API_URL=https://your-production-server.com/api
```

---

## 📋 Deployment Checklist

- [x] Code pulled from repository
- [x] Environment configured for live backend
- [x] Dependencies installed (`npm install`)
- [x] App built for production (`npm run build`)
- [x] Backend server accessible at `http://kallakuri.volvrit.org`
- [ ] Frontend served (using serve, PM2, or nginx)
- [ ] Login tested with admin credentials

---

## 🔐 Admin Credentials

Use these credentials to login to the admin panel:
- **Email**: `admin@company.com`
- **Password**: `Admin@123456`

---

## 🔗 API Configuration Summary

| Environment | API Base URL |
|-------------|-------------|
| **Current (Live)** | `http://kallakuri.volvrit.org/api` |
| Local Development | `http://localhost:3002/api` |
| Relative URLs | `/api` |

---

## 🐛 Troubleshooting

### Issue: Login fails with "Network Error"
- **Check**: Is the backend server running at `http://kallakuri.volvrit.org`?
- **Solution**: Verify the API documentation is accessible at `/api-docs/`

### Issue: CORS errors
- **Check**: Are you accessing the frontend from the correct domain?
- **Solution**: Ensure your backend allows the frontend domain in CORS settings

### Issue: API calls return 404
- **Check**: Is the API base URL correct in your `.env` file?
- **Solution**: Verify endpoints at the API documentation page

---

## 🎯 Next Steps

1. **Test the Connection**: Run `npm start` locally to test the live backend connection
2. **Deploy to VPS**: Use the build files with your preferred web server
3. **Monitor**: Check the API documentation for any new endpoints
4. **Update**: Pull the latest code regularly for updates

Happy coding! 🚀
