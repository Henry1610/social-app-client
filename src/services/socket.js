import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect(userId, token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(process.env.REACT_APP_SERVER_URL, {
      auth: {
        userId,
        token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.emit('connection:established');
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      this.emit('connection:lost');
    });

    this.socket.on('connect_error', (error) => {
      this.emit('connection:error', error);
    });

    // Notification events
    this.socket.on('notification', (data) => {this.emit('notification:received', data);});

    // Follow events
    this.socket.on('follow:new', (data) => this.emit('follow:new', data));
    this.socket.on('follow:removed', (data) => this.emit('follow:removed', data));
    this.socket.on('follow:request', (data) => this.emit('follow:request', data));
    this.socket.on('follow:accepted', (data) => this.emit('follow:accepted', data));
    this.socket.on('follow:rejected', (data) => this.emit('follow:rejected', data));

    // Chat events
    this.socket.on('chat:new_message', (data) => this.emit('chat:new_message', data));
    this.socket.on('chat:user_typing', (data) => this.emit('chat:user_typing', data));
    this.socket.on('chat:user_status', (data) => this.emit('chat:user_status', data));
    this.socket.on('chat:unread_count_update', (data) => this.emit('chat:unread_count_update', data));
    this.socket.on('chat:conversation_updated', (data) => this.emit('chat:conversation_updated', data));
    this.socket.on('message:status_update', (data) => this.emit('message:status_update', data));

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Chat methods
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:join_conversation', conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:leave_conversation', conversationId);
    }
  }

  sendMessage(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:send_message', data);
    }
  }

  setTyping(conversationId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat:typing', { conversationId, isTyping });
    }
  }


  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

export default new SocketService();