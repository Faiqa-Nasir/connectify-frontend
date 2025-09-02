import { getStoredTokens } from '../services/tokenService';
import { BASE_URL_WS } from '../constants/ApiConstants';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.messageQueue = [];
    this.heartbeatInterval = null;
    this.missedHeartbeats = 0;
    this.maxMissedHeartbeats = 3;
    this.currentConversationId = null;
    this.isConnecting = false; // Prevent simultaneous connection attempts
  }

  async connect(conversationId) {
    if (this.isConnecting) {
      console.warn('WebSocket connection already in progress.');
      return false;
    }

    this.isConnecting = true;
    this.currentConversationId = conversationId;

    try {
      const tokens = await getStoredTokens();
      if (!tokens?.access) throw new Error('No authentication token available');

      // Close existing connection if any
      if (this.ws) {
        console.log('Closing existing WebSocket connection...');
        this.ws.close();
        this.ws = null;
      }

      const wsUrl = `${BASE_URL_WS}${conversationId}/?token=${tokens.access}`;
      console.log('Connecting to WebSocket:', wsUrl);

      return new Promise((resolve, reject) => {
        const connectionTimeout = setTimeout(() => {
          console.error('WebSocket connection timeout');
          this.ws?.close();
          this.isConnecting = false;
          reject(new Error('Connection timeout'));
        }, 10000); // 10-second timeout

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.setupEventHandlers();
          this.startHeartbeat();
          this.processMessageQueue();
          console.log('WebSocket connected successfully.');
          this.broadcastStatus('online'); // Notify others that this user is online
          this.requestStatuses(); // Request statuses of all participants
          resolve(true);
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('WebSocket connection error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          this.isConnecting = false;
          this.handleConnectionClose(event);
        };
      });
    } catch (error) {
      console.error('WebSocket setup error:', error);
      this.isConnecting = false;
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        await this.handleReconnection();
      }
      return false;
    }
  }

  // Broadcast the user's status to all participants
  broadcastStatus(status) {
    this.send('broadcast_status', {
      conversation_id: this.currentConversationId,
      status: status,
      timestamp: new Date().toISOString()
    });
  }

  // Request the statuses of all participants in the conversation
  requestStatuses() {
    this.send('request_status', {
      conversation_id: this.currentConversationId
    });
  }

  setupEventHandlers() {
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'connection.established':
          this.emit('connection', { status: 'connected', data: data.data });
          break;

        case 'chat_message':
          this.emit('message', data.message);
          break;

        case 'typing':
          this.emit('typing', data);
          break;

        case 'read':
          this.emit('read', data);
          break;

        case 'heartbeat':
          this.handleHeartbeat();
          break;

        case 'error':
          console.error('WebSocket error:', data.error);
          this.emit('error', data.error);
          break;

        case 'user_status':
          this.emit('user_status', {
            userId: data.user_id,
            status: data.status,
            timestamp: data.timestamp
          });
          break;

        case 'message.status':
          this.emit('message.status', data);
          break;

        case 'status_response': // Handle status responses from other participants
          data.statuses.forEach(status => {
            this.emit('user_status', {
              userId: status.user_id,
              status: status.status,
              timestamp: status.timestamp
            });
          });
          break;

        default:
          console.warn('Unhandled WebSocket message type:', data.type);
      }
    };

    this.ws.onclose = (event) => {
      this.handleConnectionClose(event);
    };
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event, data) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  send(action, data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const payload = { action, ...data };
      this.ws.send(JSON.stringify(payload));
      return true;
    }
    this.messageQueue.push({ action, ...data });
    return false;
  }

  sendMessage(content, replyTo = null, attachments = []) {
    const localId = `temp_${Date.now()}`;
    const messageData = {
      action: 'send_message',
      conversation_id: this.currentConversationId,
      content,
      local_id: localId,
      reply_to: replyTo,
      attachments
    };

    const sent = this.send('send_message', messageData);
    if (!sent) {
      this.messageQueue.push(messageData);
    }
    return localId;
  }

  sendTypingIndicator(isTyping) {
    this.send('typing', {
      conversation_id: this.currentConversationId,
      is_typing: isTyping
    });
  }

  sendReadReceipt(messageIds) {
    this.send('read', {
      conversation_id: this.currentConversationId,
      message_ids: messageIds
    });
  }

  fetchMessages(beforeId = null, limit = 20) {
    this.send('fetch_messages', {
      conversation_id: this.currentConversationId,
      before_id: beforeId,
      limit
    });
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('heartbeat', {});
        this.missedHeartbeats++;
        if (this.missedHeartbeats >= this.maxMissedHeartbeats) {
          console.warn('Missed too many heartbeats, reconnecting...');
          this.handleReconnection();
        }
      }
    }, 30000);
  }

  handleHeartbeat() {
    this.missedHeartbeats = 0;
  }

  async handleReconnection() {
    const backoffDelay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000) + Math.random() * 1000; // Add jitter

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting WebSocket in ${backoffDelay / 1000} seconds...`);
      setTimeout(() => this.connect(this.currentConversationId), backoffDelay);
    } else {
      console.error('Max reconnect attempts reached. Giving up.');
      this.emit('error', { code: 'MAX_RECONNECT_ATTEMPTS', message: 'Failed to reconnect' });
    }
  }

  handleConnectionClose(event) {
    clearInterval(this.heartbeatInterval);

    if (event.code === 1006) { // Connection reset
      console.log('Connection reset, attempting reconnect...');
      this.handleReconnection();
      return;
    }

    switch (event.code) {
      case 1000:
        console.log('WebSocket closed normally.');
        break;
      case 4003:
        console.error('WebSocket error: Unauthorized');
        this.emit('error', { code: 'UNAUTHORIZED', message: 'Authentication failed' });
        break;
      case 4004:
        console.error('WebSocket error: Access denied');
        this.emit('error', { code: 'ACCESS_DENIED', message: 'Access denied' });
        break;
      default:
        console.error(`WebSocket closed with code: ${event.code}`);
        this.handleReconnection();
    }
  }

  async processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      try {
        await this.send(message.action, message);
      } catch (error) {
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  disconnect() {
    if (this.ws) {
      clearInterval(this.heartbeatInterval);
      this.ws.close(1000);
      this.ws = null;
    }
  }
}

const websocketManager = new WebSocketManager();
export default websocketManager;
