import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import familyRoutes from './routes/family';
import cemeteryRoutes from './routes/cemetery';
import memorialRoutes from './routes/memorial';
import donationRoutes from './routes/donations';
import campaignRoutes from './routes/campaigns';
import branchRoutes from './routes/branches';
import announcementRoutes from './routes/announcements';
import configRoutes from './routes/config';
import importExportRoutes from './routes/importExport';
import operationLogRoutes from './routes/operationLogs';
import infoRequestRoutes from './routes/infoRequests';
import searchRoutes from './routes/search';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for simplicity in this demo, enable/configure in production
}));
app.use(cors());
app.use(express.json());
app.use('/api', rateLimiter); // Apply rate limiter only to API routes

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/cemeteries', cemeteryRoutes);
app.use('/api/memorial', memorialRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/config', configRoutes);
app.use('/api/import-export', importExportRoutes);
app.use('/api/logs', operationLogRoutes);
app.use('/api/requests', infoRequestRoutes);
app.use('/api/search', searchRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from the Vue frontend app
const frontendPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendPath));

// Handle SPA routing: return index.html for any unknown non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ success: false, error: 'API Endpoint Not Found' });
  }
});

// 错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`宗族数字化平台服务运行在 http://localhost:${PORT}`);
});
