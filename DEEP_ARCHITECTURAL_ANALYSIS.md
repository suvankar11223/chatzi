# Deep Architectural Analysis: Contact Loading Failure

## Executive Summary

Your contacts are returning 0 because **the database was not seeded**. However, there are **12 critical architectural issues** that make your system fragile and prone to silent failures. This document provides production-grade solutions.

---

## ROOT CAUSE ANALYSIS

### Primary Issue: Empty Database
```
API returns: { success: true, data: [] }
Reason: No users exist in MongoDB except the logged-in user
```

**Why this is a silent failure:**
- API returns 200 OK with empty array
- Frontend treats empty array as valid response
- No error thrown, no alert shown
- User sees "No users available" without understanding why

---

## 12 CRITICAL ARCHITECTURAL ISSUES

### 1. **SERVER BINDING ISSUE** ⚠️ CRITICAL

**Current Code (backend/index.ts):**
```typescript
server.listen(PORT, () => {
  console.log('Server is running on Port', PORT);
});
```

**Problem:**
- Defaults to `localhost` (127.0.0.1) binding
- Physical devices on network CANNOT reach the server
- Only works for iOS simulator

**Fix:**
```typescript
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://${getLocalIP()}:${PORT}`);
});
```

**Impact:** This alone could explain "Network request failed" errors.

---

### 2. **SOCKET.IO TRANSPORT ORDER** ⚠️ CRITICAL

**Current Code (backend/socket/socket.ts):**
```typescript
transports: ['websocket', 'polling']
```

**Problem:**
- WebSocket requires stable connection
- Mobile networks are unstable
- If WebSocket fails, polling should be tried first
- Current order causes "xhr poll error"

**Fix:**
```typescript
transports: ['polling', 'websocket'], // Polling first for reliability
pingTimeout: 60000,
pingInterval: 25000,
upgradeTimeout: 30000,
```

**Frontend Fix (frontend/socket/socket.ts):**
```typescript
transports: ["polling", "websocket"], // Match backend order
reconnectionAttempts: Infinity, // Never give up
reconnectionDelay: 1000,
reconnectionDelayMax: 5000,
```

---

### 3. **RACE CONDITION IN DATA LOADING** ⚠️ HIGH

**Current Code (frontend/app/(main)/home.tsx):**
```typescript
useEffect(() => {
  // Setup socket listeners
  getConversations(processConversations);
  getContacts(processContacts);
  
  // Fetch from API
  loadContactsFromAPI();
  
  // Socket fetch
  const socket = getSocket();
  if (socket && socket.connected) {
    getConversations(null);
    getContacts(null);
  }
}, []);
```

**Problems:**
1. Socket listeners registered BEFORE socket connects
2. API and Socket both fetch simultaneously (race condition)
3. If socket connects late, listeners miss events
4. No guarantee which data source wins

**Fix - Sequential Loading with Fallback:**
```typescript
useEffect(() => {
  let mounted = true;
  
  const loadData = async () => {
    setLoading(true);
    
    // 1. Try API first (most reliable)
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const [contacts, conversations] = await Promise.all([
        fetchContactsFromAPI(token),
        fetchConversationsFromAPI(token)
      ]);
      
      if (!mounted) return;
      
      if (contacts.length > 0) {
        setContacts(contacts);
        setDataLoaded(true);
      }
      
      if (conversations.length > 0) {
        setConversations(conversations);
      }
    } catch (error) {
      console.error('[ERROR] API fetch failed:', error);
    }
    
    // 2. Setup socket for real-time updates (after API data loaded)
    const socket = getSocket();
    if (socket?.connected) {
      setupSocketListeners();
    } else {
      // Wait for socket to connect
      const checkSocket = setInterval(() => {
        const s = getSocket();
        if (s?.connected) {
          clearInterval(checkSocket);
          setupSocketListeners();
        }
      }, 1000);
      
      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkSocket), 10000);
    }
    
    setLoading(false);
  };
  
  const setupSocketListeners = () => {
    getConversations(processConversations);
    newConversation(newConversationHandler);
    getContacts(processContacts);
    newMessage(handleNewMessage);
  };
  
  loadData();
  
  return () => {
    mounted = false;
    // Cleanup socket listeners
  };
}, []);
```

---

### 4. **NO ERROR BOUNDARIES** ⚠️ HIGH

**Problem:**
- Fetch errors are caught but not surfaced to user
- Silent failures everywhere
- User has no idea what's wrong

**Fix - Add Error State:**
```typescript
const [error, setError] = useState<string | null>(null);

const loadContactsFromAPI = async () => {
  try {
    setError(null);
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('Not authenticated. Please login again.');
      return;
    }
    
    const contacts = await fetchContactsFromAPI(token);
    
    if (contacts.length === 0) {
      // This is the key fix - distinguish between error and empty
      setError('No other users found. Ask friends to sign up!');
    } else {
      setContacts(contacts);
      setDataLoaded(true);
    }
  } catch (error: any) {
    const errorMsg = error.message || 'Failed to load contacts';
    setError(errorMsg);
    
    // Show alert for critical errors
    if (errorMsg.includes('Network') || errorMsg.includes('timeout')) {
      Alert.alert(
        'Connection Error',
        'Cannot reach server. Check your network connection.',
        [
          { text: 'Retry', onPress: () => loadContactsFromAPI() },
          { text: 'Cancel' }
        ]
      );
    }
  }
};

// In render:
{error && (
  <View style={styles.errorContainer}>
    <Typo color={colors.error}>{error}</Typo>
    <Button onPress={() => loadContactsFromAPI()}>Retry</Button>
  </View>
)}
```

---

### 5. **INCONSISTENT ERROR HANDLING** ⚠️ MEDIUM

**Problem:**
```typescript
// Backend returns different error formats
res.status(500).json({ success: false, msg: error.message });
res.status(401).json({ success: false, msg: 'Access token required' });
res.status(404).json({ success: false, msg: 'User not found' });
```

**Fix - Standardized Error Response:**
```typescript
// backend/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';
  
  console.error('[ERROR]', {
    code,
    message,
    statusCode,
    path: req.path,
    method: req.method,
    userId: (req as any).user?.userId,
    stack: err.stack
  });
  
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      statusCode
    }
  });
};

// Usage in controllers:
if (!users || users.length === 0) {
  throw new AppError(404, 'No users found', 'NO_USERS');
}
```

---

### 6. **TOKEN EXPIRATION NOT HANDLED** ⚠️ HIGH

**Problem:**
- JWT expires after X hours
- No refresh token mechanism
- User gets 403 errors silently
- No automatic re-login

**Fix - Token Refresh Interceptor:**
```typescript
// frontend/services/apiClient.ts
export const apiClient = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await AsyncStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  // Check if token is expired
  try {
    const decoded = jwtDecode<DecodedTokenProps>(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp && decoded.exp < currentTime) {
      // Token expired - force logout
      await AsyncStorage.removeItem('token');
      throw new Error('TOKEN_EXPIRED');
    }
  } catch (error) {
    if (error.message === 'TOKEN_EXPIRED') {
      // Navigate to login
      throw error;
    }
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (response.status === 401 || response.status === 403) {
    // Token invalid - force logout
    await AsyncStorage.removeItem('token');
    throw new Error('Authentication failed. Please login again.');
  }
  
  return response;
};
```

---

### 7. **NO HEALTH CHECK BEFORE DATA FETCH** ⚠️ MEDIUM

**Problem:**
- App tries to fetch data without checking if server is reachable
- Wastes time on timeouts
- Poor user experience

**Fix:**
```typescript
// frontend/utils/network.ts
export const checkServerHealth = async (): Promise<boolean> => {
  try {
    const { getApiUrl } = await import('@/constants');
    const API_URL = await getApiUrl();
    const healthUrl = API_URL.replace('/api', '/api/health');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(healthUrl, {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Use before fetching:
const loadData = async () => {
  const isHealthy = await checkServerHealth();
  
  if (!isHealthy) {
    setError('Server is unreachable. Please check your connection.');
    return;
  }
  
  // Proceed with data fetch
};
```

---

### 8. **SOCKET RECONNECTION LOGIC FLAWED** ⚠️ HIGH

**Current Code:**
```typescript
reconnectionAttempts: maxReconnectAttempts, // 10
```

**Problem:**
- Gives up after 10 attempts
- In production, network can be down for minutes
- Should retry indefinitely with exponential backoff

**Fix:**
```typescript
const socket = io(SOCKET_URL, {
  auth: { token },
  transports: ["polling", "websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity, // Never give up
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
  autoConnect: true,
});

// Add reconnection event handlers
socket.on('reconnect', (attemptNumber) => {
  console.log(`[Socket] Reconnected after ${attemptNumber} attempts`);
  
  // Re-fetch data after reconnection
  socket.emit('getConversations');
  socket.emit('getContacts');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`[Socket] Reconnection attempt ${attemptNumber}`);
});

socket.on('reconnect_error', (error) => {
  console.error('[Socket] Reconnection error:', error.message);
});

socket.on('reconnect_failed', () => {
  console.error('[Socket] Reconnection failed - switching to API mode');
  // Fall back to polling API
});
```

---

### 9. **CONVERSATION FETCHING ARCHITECTURE FLAW** ⚠️ CRITICAL

**Current Problem:**
- Conversations fetched via Socket AND API
- No clear source of truth
- Race conditions
- Duplicate data

**Production-Ready Architecture:**

```typescript
/**
 * SINGLE SOURCE OF TRUTH PATTERN
 * 
 * 1. API is the source of truth (persistent storage)
 * 2. Socket provides real-time updates (ephemeral)
 * 3. Local state is the cache (in-memory)
 * 4. AsyncStorage is the offline cache (persistent)
 */

// Data Flow:
// API → Local State → UI
// Socket → Local State → UI
// Local State → AsyncStorage (background)

class ConversationManager {
  private conversations: Map<string, Conversation> = new Map();
  private listeners: Set<(convs: Conversation[]) => void> = new Set();
  
  // Fetch from API (source of truth)
  async fetchFromAPI(token: string): Promise<void> {
    const response = await apiClient(`${API_URL}/user/conversations`);
    const data = await response.json();
    
    if (data.success) {
      // Update local state
      data.data.forEach((conv: Conversation) => {
        this.conversations.set(conv._id, conv);
      });
      
      // Notify listeners
      this.notifyListeners();
      
      // Cache for offline
      await this.cacheConversations();
    }
  }
  
  // Handle socket updates (real-time)
  handleSocketUpdate(conversation: Conversation): void {
    // Merge with existing data
    const existing = this.conversations.get(conversation._id);
    
    if (existing) {
      // Update existing
      this.conversations.set(conversation._id, {
        ...existing,
        ...conversation,
        updatedAt: conversation.updatedAt || existing.updatedAt
      });
    } else {
      // Add new
      this.conversations.set(conversation._id, conversation);
    }
    
    this.notifyListeners();
    this.cacheConversations();
  }
  
  // Subscribe to changes
  subscribe(listener: (convs: Conversation[]) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  private notifyListeners(): void {
    const convArray = Array.from(this.conversations.values())
      .sort((a, b) => {
        const aTime = new Date(a.updatedAt || a.createdAt).getTime();
        const bTime = new Date(b.updatedAt || b.createdAt).getTime();
        return bTime - aTime;
      });
    
    this.listeners.forEach(listener => listener(convArray));
  }
  
  private async cacheConversations(): Promise<void> {
    try {
      const convArray = Array.from(this.conversations.values());
      await AsyncStorage.setItem(
        'conversations_cache',
        JSON.stringify(convArray)
      );
    } catch (error) {
      console.error('Failed to cache conversations:', error);
    }
  }
}

// Usage:
const conversationManager = new ConversationManager();

// In component:
useEffect(() => {
  const unsubscribe = conversationManager.subscribe(setConversations);
  
  // Initial fetch
  conversationManager.fetchFromAPI(token);
  
  // Setup socket listener
  const socket = getSocket();
  socket?.on('newConversation', (data) => {
    if (data.success) {
      conversationManager.handleSocketUpdate(data.data);
    }
  });
  
  return () => {
    unsubscribe();
    socket?.off('newConversation');
  };
}, []);
```

---

### 10. **NO RETRY LOGIC FOR CRITICAL OPERATIONS** ⚠️ MEDIUM

**Problem:**
- Single fetch attempt
- Network blips cause permanent failures
- No exponential backoff

**Fix:**
```typescript
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error: any) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.min(
          initialDelay * Math.pow(2, attempt),
          maxDelay
        );
        
        onRetry?.(attempt + 1, error);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Usage:
const contacts = await fetchWithRetry(
  () => fetchContactsFromAPI(token),
  {
    maxRetries: 3,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt} after error:`, error.message);
    }
  }
);
```

---

### 11. **LOGGING IS INSUFFICIENT** ⚠️ MEDIUM

**Problem:**
- Logs don't include request IDs
- Can't trace a request through the system
- No structured logging

**Fix - Structured Logging:**
```typescript
// backend/utils/logger.ts
import { v4 as uuidv4 } from 'uuid';

export class Logger {
  private requestId: string;
  
  constructor(requestId?: string) {
    this.requestId = requestId || uuidv4();
  }
  
  private log(level: string, message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      requestId: this.requestId,
      message,
      ...meta
    };
    
    console.log(JSON.stringify(logEntry));
  }
  
  info(message: string, meta?: any): void {
    this.log('INFO', message, meta);
  }
  
  error(message: string, error?: Error, meta?: any): void {
    this.log('ERROR', message, {
      ...meta,
      error: error?.message,
      stack: error?.stack
    });
  }
  
  debug(message: string, meta?: any): void {
    this.log('DEBUG', message, meta);
  }
}

// Middleware to add request ID:
app.use((req, res, next) => {
  const requestId = uuidv4();
  (req as any).requestId = requestId;
  (req as any).logger = new Logger(requestId);
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Usage in controllers:
export const getContacts = async (req: Request, res: Response) => {
  const logger = (req as any).logger as Logger;
  const userId = (req as any).user.userId;
  
  logger.info('Fetching contacts', { userId });
  
  try {
    const users = await User.find({ _id: { $ne: userId } });
    
    logger.info('Contacts fetched successfully', {
      userId,
      contactCount: users.length
    });
    
    res.json({ success: true, data: users });
  } catch (error: any) {
    logger.error('Failed to fetch contacts', error, { userId });
    res.status(500).json({ success: false, msg: error.message });
  }
};
```

---

### 12. **NO MONITORING/ALERTING** ⚠️ LOW (but important for production)

**Problem:**
- No way to know if system is failing in production
- No metrics on API response times
- No error rate tracking

**Fix - Basic Monitoring:**
```typescript
// backend/utils/metrics.ts
class MetricsCollector {
  private metrics: Map<string, number[]> = new Map();
  
  recordResponseTime(endpoint: string, duration: number): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    this.metrics.get(endpoint)!.push(duration);
  }
  
  getAverageResponseTime(endpoint: string): number {
    const times = this.metrics.get(endpoint) || [];
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
  
  logMetrics(): void {
    console.log('=== METRICS REPORT ===');
    this.metrics.forEach((times, endpoint) => {
      const avg = this.getAverageResponseTime(endpoint);
      console.log(`${endpoint}: ${avg.toFixed(2)}ms avg (${times.length} requests)`);
    });
  }
}

const metrics = new MetricsCollector();

// Middleware:
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.recordResponseTime(req.path, duration);
    
    if (duration > 1000) {
      console.warn(`[SLOW] ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
});

// Log metrics every 5 minutes:
setInterval(() => metrics.logMetrics(), 5 * 60 * 1000);
```

---

## STEP-BY-STEP DEBUGGING CHECKLIST

### Phase 1: Database Verification
- [ ] Run `npm run check-users` in backend
- [ ] Verify at least 2 users exist
- [ ] If empty, run `npm run seed`
- [ ] Verify users created successfully

### Phase 2: Backend Verification
- [ ] Backend running on port 3000
- [ ] Check console for "SERVER STARTED SUCCESSFULLY"
- [ ] Test health endpoint: `curl http://localhost:3000/api/health`
- [ ] Should return `{"success":true,"status":"ok"}`

### Phase 3: Network Verification
- [ ] Get computer IP: `ipconfig` (Windows) or `ifconfig` (Mac)
- [ ] Verify IP in `frontend/utils/network.ts` matches
- [ ] Phone and computer on SAME WiFi network
- [ ] Test from phone browser: `http://YOUR_IP:3000/api/health`
- [ ] Should return JSON response

### Phase 4: Authentication Verification
- [ ] Login with test account: `tini@test.com` / `password123`
- [ ] Check AsyncStorage for token
- [ ] Decode token to verify userId
- [ ] Token should not be expired

### Phase 5: API Verification
- [ ] Check backend logs for `[DEBUG] getContacts API: Request received`
- [ ] Should show current user ID
- [ ] Should show contact count > 0
- [ ] Check frontend logs for `[DEBUG] fetchContactsFromAPI: SUCCESS!`

### Phase 6: Socket Verification
- [ ] Check backend logs for `[DEBUG] Socket: User connected`
- [ ] Check frontend logs for `[Socket] Connected`
- [ ] If not connected, check CORS and transport settings
- [ ] Verify socket auth token is valid

### Phase 7: Data Flow Verification
- [ ] Contacts should load from API first
- [ ] Socket should connect in background
- [ ] Pull-to-refresh should work
- [ ] New users should appear immediately

---

## PRODUCTION-READY IMPROVEMENTS

### 1. Environment-Based Configuration
```typescript
// backend/config/index.ts
export const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGO_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Socket.IO config
  socket: {
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['polling', 'websocket'],
  },
  
  // CORS config
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://yourdomain.com']
      : '*',
    credentials: true,
  },
};

// Validate required env vars on startup
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

### 2. Database Connection Pooling
```typescript
// backend/config/db.ts
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected with connection pooling');
    
    // Monitor connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
```

### 3. Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
```

### 4. Request Validation
```typescript
import { body, validationResult } from 'express-validator';

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Usage:
router.post('/login', validateLogin, login);
```

---

## WHY CONTACTS RETURN EMPTY (9 Scenarios)

1. **Database Empty**: No users seeded → Run seed script
2. **Only One User**: Current user is only user → Create more accounts
3. **Wrong User ID**: Token has wrong userId → Re-login
4. **Token Expired**: JWT expired → Implement refresh token
5. **Database Connection Lost**: MongoDB disconnected → Check connection
6. **Query Error**: Mongoose query fails silently → Add error logging
7. **Network Timeout**: Request times out → Increase timeout
8. **CORS Blocked**: Browser/app blocks request → Fix CORS config
9. **Server Not Bound**: Server only on localhost → Bind to 0.0.0.0

---

## FINAL RECOMMENDATIONS

### Immediate Fixes (Do Now)
1. ✅ Seed database: `npm run seed`
2. ✅ Fix server binding to `0.0.0.0`
3. ✅ Fix Socket.IO transport order
4. ✅ Add error boundaries and user feedback
5. ✅ Implement health check before data fetch

### Short-term Improvements (This Week)
1. Implement ConversationManager pattern
2. Add structured logging with request IDs
3. Add retry logic with exponential backoff
4. Implement token refresh mechanism
5. Add comprehensive error handling

### Long-term Improvements (This Month)
1. Add monitoring and metrics
2. Implement rate limiting
3. Add request validation
4. Set up proper environment configs
5. Add automated tests for critical paths

---

## CONCLUSION

Your system has a **fragile architecture** that works in ideal conditions but fails silently under real-world scenarios. The immediate issue is an empty database, but the underlying problems are:

1. No resilience to network failures
2. No clear error communication
3. Race conditions in data loading
4. Poor socket reconnection logic
5. No monitoring or observability

Implement the fixes in order of priority (Critical → High → Medium → Low) to build a production-ready, WhatsApp-level messaging system.
