# WebSocket Chat API Documentation

## Connection Details
import BASE_WS_URL from apiconstant file

### Connection Status Codes
- 4003: Unauthorized (Invalid/Missing token)
- 4004: Access denied
- 1000: Normal closure
- 1006: Abnormal closure (Connection lost)

## Message Protocols

### 1. Initial Connection Response
```javascript
// Server Response on successful connection
{
    "type": "connection.established",
    "data": {
        "client_id": "user_123_456",
        "user_id": "123",
        "active_conversations": ["789", "101"],
        "timestamp": "2023-12-01T12:00:00Z"
    }
}
```

### 2. Message Operations

#### Send Message
```javascript
// Request
{
    "action": "send_message",
    "conversation_id": "789",
    "content": "Hello!",
    "local_id": "temp_123", // Required for tracking
    "reply_to": "456",      // Optional - ID of message being replied to
    "attachments": [{       // Optional
        "type": "image",
        "file": "base64_content",
        "filename": "photo.jpg"
    }]
}

// Success Response
{
    "type": "chat_message",
    "message": {
        "id": "901",
        "local_id": "temp_123",
        "sender_id": "123",
        "conversation_id": "789",
        "content": "Hello!",
        "sent_at": "2023-12-01T12:00:00Z",
        "status": "sent",
        "attachments": [{
            "id": "att_123",
            "type": "image",
            "url": "https://..."
        }]
    }
}

// Error Response
{
    "type": "error",
    "error": {
        "code": "MESSAGE_FAILED",
        "message": "Failed to send message",
        "local_id": "temp_123"
    }
}
```

#### Message Lifecycle States
```javascript
const MESSAGE_STATES = {
    SENDING: 'sending',
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed'
};
```

### 3. Real-time Events

#### Typing Indicators
```javascript
// Send typing status
{
    "action": "typing",
    "conversation_id": "789",
    "is_typing": true
}

// Receive typing updates
{
    "type": "typing_indicator",
    "data": {
        "user_id": "123",
        "conversation_id": "789",
        "is_typing": true,
        "timestamp": "2023-12-01T12:00:00Z"
    }
}
```

#### Read Receipts
```javascript
// Mark messages as read
{
    "action": "mark_read",
    "conversation_id": "789",
    "message_ids": ["901", "902"]
}

// Receive read status
{
    "type": "messages_read",
    "data": {
        "user_id": "123",
        "conversation_id": "789",
        "message_ids": ["901", "902"],
        "timestamp": "2023-12-01T12:00:00Z"
    }
}
```

## Redux Implementation

### Store Structure
```javascript
const initialState = {
    connection: {
        status: 'disconnected', // 'connecting' | 'connected' | 'disconnected'
        lastConnected: null,
        error: null
    },
    conversations: {
        byId: {},
        allIds: []
    },
    messages: {
        byId: {},
        byConversation: {}
    },
    typing: {
        byConversation: {}
    },
    messageQueue: [] // For offline messages
};
```

### Action Creators
```javascript
const chatActions = {
    // Connection actions
    connect: () => ({ type: 'chat/connect' }),
    connectionEstablished: (data) => ({ 
        type: 'chat/connectionEstablished', 
        payload: data 
    }),
    
    // Message actions
    sendMessage: (message) => ({
        type: 'chat/sendMessage',
        payload: message
    }),
    messageReceived: (message) => ({
        type: 'chat/messageReceived',
        payload: message
    }),
    
    // Status actions
    updateMessageStatus: (messageId, status) => ({
        type: 'chat/updateMessageStatus',
        payload: { messageId, status }
    })
};
```

## Offline Support Implementation

```javascript
class MessageQueue {
    static async addToQueue(message) {
        const queue = await this.getQueue();
        queue.push(message);
        await AsyncStorage.setItem('messageQueue', JSON.stringify(queue));
    }

    static async processQueue(wsClient) {
        const queue = await this.getQueue();
        for (const message of queue) {
            try {
                await wsClient.send(JSON.stringify(message));
                // Remove from queue after successful send
                await this.removeFromQueue(message.local_id);
            } catch (error) {
                console.error('Failed to send queued message:', error);
                break; // Stop processing if sending fails
            }
        }
    }
}
```

## WebSocket Client Class

```javascript
class ChatWebSocket {
    constructor(token) {
        this.token = token;
        this.messageQueue = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.listeners = new Map();
    }

    connect() {
        this.ws = new WebSocket(`${WS_BASE_URL}?token=${this.token}`);
        this.setupEventHandlers();
    }

    on(event, callback) {
        this.listeners.set(event, callback);
    }

    send(message) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            return true;
        }
        MessageQueue.addToQueue(message);
        return false;
    }
}
```

## Error Handling Best Practices

1. Implement retry logic for failed messages:
```javascript
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

async function sendWithRetry(message, retriesLeft = MAX_RETRIES) {
    try {
        await chatClient.send(message);
    } catch (error) {
        if (retriesLeft > 0) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return sendWithRetry(message, retriesLeft - 1);
        }
        throw error;
    }
}
```

2. Handle reconnection with exponential backoff:
```javascript
const getBackoffDelay = (attempt) => Math.min(1000 * Math.pow(2, attempt), 30000);
```

3. Implement message deduplication:
```javascript
const seenMessages = new Set();
const isDuplicate = (messageId) => {
    if (seenMessages.has(messageId)) return true;
    seenMessages.add(messageId);
    return false;
};
```

## Connection Health Monitoring

1. Implement heartbeat handling:
```javascript
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

function startHeartbeat() {
    return setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ action: 'heartbeat' }));
        }
    }, HEARTBEAT_INTERVAL);
}
```

2. Monitor connection health:
```javascript
const MAX_MISSED_HEARTBEATS = 3;
let missedHeartbeats = 0;

function checkConnectionHealth() {
    if (missedHeartbeats >= MAX_MISSED_HEARTBEATS) {
        reconnect();
    }
}
```

This enhanced documentation provides comprehensive guidance for frontend developers to implement the chat functionality, including proper error handling, offline support, and connection management.
