import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';
import { Send, Paperclip, Smile, Search, Phone, Video, MoreVertical, User, ArrowLeft } from 'lucide-react';

const Messages = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [onlineStatuses, setOnlineStatuses] = useState({});
    const [typingUsers, setTypingUsers] = useState({});
    
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        if (!user) return;

        // Strip /api from API_BASE_URL to get socket URL
        const socketUrl = API_BASE_URL.replace('/api', '');
        const newSocket = io(socketUrl);

        newSocket.on('connect', () => {
            console.log('Socket connected for chat');
            newSocket.emit('register-user', { userId: user.id || user._id });
        });

        newSocket.on('user-status-change', ({ userId, status }) => {
            setOnlineStatuses(prev => ({
                ...prev,
                [userId]: status === 'online'
            }));
        });

        newSocket.on('new-message', ({ message, conversationId }) => {
            // If viewing this conversation, append message
            setActiveConversation(current => {
                if (current && current._id === conversationId) {
                    setMessages(prev => [...prev, message]);
                    // Mark as read immediately if viewing
                    if (message.sender._id !== (user.id || user._id)) {
                        api.put(`/conversations/${conversationId}/read`).catch(console.error);
                    }
                }
                return current;
            });

            // Update conversation list lastMessage and unread counts
            setConversations(prev => {
                const copy = [...prev];
                const idx = copy.findIndex(c => c._id === conversationId);
                if (idx !== -1) {
                    const conv = { ...copy[idx] };
                    conv.lastMessage = message;
                    
                    // Update unread count if we aren't currently viewing this conversation
                    let isViewing = false;
                    setActiveConversation(curr => { isViewing = curr?._id === conversationId; return curr; });
                    
                    if (!isViewing && message.sender._id !== (user.id || user._id)) {
                        conv.unreadCounts = conv.unreadCounts || {};
                        const myIdStr = (user.id || user._id).toString();
                        conv.unreadCounts[myIdStr] = (conv.unreadCounts[myIdStr] || 0) + 1;
                    }
                    
                    copy.splice(idx, 1);
                    copy.unshift(conv); // Move to top
                }
                return copy;
            });
        });

        newSocket.on('user-typing', ({ conversationId, userId }) => {
            setTypingUsers(prev => ({ ...prev, [`${conversationId}_${userId}`]: true }));
        });

        newSocket.on('user-stopped-typing', ({ conversationId, userId }) => {
            setTypingUsers(prev => {
                const next = { ...prev };
                delete next[`${conversationId}_${userId}`];
                return next;
            });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { data } = await api.get('/conversations');
                if (data.success) {
                    setConversations(data.conversations);
                    
                    // Get online statuses for all participants
                    if (socket) {
                        const userIds = [];
                        data.conversations.forEach(conv => {
                            conv.participants.forEach(p => {
                                if (p._id !== (user.id || user._id)) userIds.push(p._id);
                            });
                        });
                        
                        socket.emit('check-online-status', { userIds }, (statuses) => {
                            setOnlineStatuses(prev => ({ ...prev, ...statuses }));
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [user, socket]);

    // Fetch messages when conversation selected
    useEffect(() => {
        if (!activeConversation) return;

        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/conversations/${activeConversation._id}/messages`);
                if (data.success) {
                    setMessages(data.messages);
                    
                    // Update unread count locally
                    setConversations(prev => 
                        prev.map(c => {
                            if (c._id === activeConversation._id) {
                                const newC = { ...c };
                                if (newC.unreadCounts) {
                                    newC.unreadCounts[(user.id || user._id).toString()] = 0;
                                }
                                return newC;
                            }
                            return c;
                        })
                    );
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();
        
        // Join socket room
        if (socket) {
            socket.emit('join-chat', { conversationId: activeConversation._id });
        }

    }, [activeConversation, socket, user]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;

        const content = newMessage.trim();
        setNewMessage('');
        
        // Stop typing immediately
        if (socket) {
            socket.emit('stop-typing', { conversationId: activeConversation._id, userId: user.id || user._id });
        }
        clearTimeout(typingTimeoutRef.current);

        try {
            await api.post('/conversations/message', {
                conversationId: activeConversation._id,
                content
            });
            // Result is handled via socket 'new-message'
        } catch (error) {
            console.error("Error sending message:", error);
            // Revert message on error (simplified here)
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        if (socket && activeConversation) {
            socket.emit('typing', { conversationId: activeConversation._id, userId: user.id || user._id });
            
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stop-typing', { conversationId: activeConversation._id, userId: user.id || user._id });
            }, 2000);
        }
    };

    const getOtherParticipant = (conversation) => {
        if (!conversation || !conversation.participants) return null;
        return conversation.participants.find(p => p._id !== (user.id || user._id));
    };

    // View components
    const otherParticipant = activeConversation ? getOtherParticipant(activeConversation) : null;
    const isOtherTyping = activeConversation && otherParticipant && typingUsers[`${activeConversation._id}_${otherParticipant._id}`];

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
            
            {/* Sidebar (Conversations List) */}
            <div className={`flex w-full flex-col border-r border-slate-200 dark:border-slate-800 md:w-80 lg:w-96 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Messages</h2>
                    <div className="relative mt-4">
                        <input 
                            type="text" 
                            placeholder="Search messages..." 
                            className="w-full rounded-xl border-none bg-slate-100 dark:bg-slate-900 px-4 py-2 pl-10 text-sm focus:ring-2 focus:ring-blue-500 dark:text-slate-200"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {conversations.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                            No conversations yet. {user.role === 'client' ? 'Book a lawyer to start chatting.' : 'Wait for clients to message you.'}
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const other = getOtherParticipant(conv);
                            const isOnline = other ? onlineStatuses[other._id] : false;
                            const unreadCount = conv.unreadCounts ? (conv.unreadCounts[(user.id || user._id).toString()] || 0) : 0;
                            const isSelected = activeConversation?._id === conv._id;

                            return (
                                <div 
                                    key={conv._id}
                                    onClick={() => setActiveConversation(conv)}
                                    className={`relative flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors ${
                                        isSelected 
                                            ? 'bg-blue-50 dark:bg-blue-900/20' 
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-900'
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold overflow-hidden">
                                        {other?.profile_image ? (
                                            <img src={other.profile_image} alt={other.name} className="h-full w-full object-cover" />
                                        ) : (
                                            other?.name?.charAt(0)?.toUpperCase() || 'U'
                                        )}
                                        {isOnline && (
                                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950 bg-green-500" />
                                        )}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex flex-1 flex-col overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
                                                {other?.name}
                                            </span>
                                            {conv.lastMessage && (
                                                <span className="text-xs text-slate-400">
                                                    {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="truncate text-sm text-slate-500 dark:text-slate-400">
                                                {typingUsers[`${conv._id}_${other?._id}`] 
                                                    ? <span className="text-blue-500 italic">Typing...</span>
                                                    : (conv.lastMessage?.content || 'Started a conversation')
                                                }
                                            </span>
                                            {unreadCount > 0 && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            {activeConversation ? (
                <div className="flex flex-1 flex-col bg-slate-50 dark:bg-slate-900/50">
                    
                    {/* Chat Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setActiveConversation(null)}
                                className="md:hidden flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            </button>
                            
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                {otherParticipant?.profile_image ? (
                                    <img src={otherParticipant.profile_image} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-5 w-5 text-slate-500" />
                                )}
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100">
                                    {otherParticipant?.name}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {onlineStatuses[otherParticipant?._id] ? (
                                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500"></span> Online</span>
                                    ) : 'Offline'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <Phone className="h-5 w-5" />
                            </button>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <Video className="h-5 w-5" />
                            </button>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-slate-400">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                    <User className="h-8 w-8" />
                                </div>
                                <p>Start your conversation with {otherParticipant?.name}</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMine = msg.sender._id === (user.id || user._id);
                                const showAvatar = !isMine && (idx === 0 || messages[idx-1].sender._id !== msg.sender._id);
                                
                                return (
                                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
                                        <div className={`flex max-w-[75%] gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                                            
                                            {/* Avatar for other user */}
                                            {!isMine ? (
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-auto">
                                                    {showAvatar ? (
                                                        otherParticipant?.profile_image ? (
                                                            <img src={otherParticipant.profile_image} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-500">{otherParticipant?.name?.charAt(0)}</span>
                                                        )
                                                    ) : null}
                                                </div>
                                            ) : null}

                                            {/* Message Bubble */}
                                            <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                                <div 
                                                    className={`rounded-2xl px-4 py-2 ${
                                                        isMine 
                                                            ? 'rounded-br-sm bg-blue-600 text-white' 
                                                            : 'rounded-bl-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700'
                                                    }`}
                                                >
                                                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                                </div>
                                                <span className="mt-1 text-[10px] text-slate-400">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        {isOtherTyping && (
                            <div className="flex justify-start">
                                <div className="flex max-w-[75%] gap-2">
                                    <div className="flex h-8 w-8 shrink-0 rounded-full" />
                                    <div className="rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 px-4 py-3 border border-slate-100 dark:border-slate-700">
                                        <div className="flex gap-1">
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400"></span>
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.2s' }}></span>
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.4s' }}></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-white dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <Paperclip className="h-5 w-5" />
                            </button>
                            
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleTyping}
                                    placeholder="Type a message..."
                                    className="w-full rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white"
                                />
                                <button type="button" className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <Smile className="h-5 w-5" />
                                </button>
                            </div>

                            <button 
                                type="submit" 
                                disabled={!newMessage.trim()}
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Send className="h-5 w-5 ml-1" />
                            </button>
                        </form>
                    </div>

                </div>
            ) : (
                /* Empty State (when no conversation is selected) */
                <div className="hidden flex-1 flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 text-center md:flex">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Send className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-slate-800 dark:text-slate-100">CaseXpert Messages</h2>
                    <p className="max-w-sm text-slate-500 dark:text-slate-400">
                        Select a conversation from the sidebar to start chatting with your lawyer or client.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Messages;
