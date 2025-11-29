import { useState, useEffect, useRef, useCallback } from 'react';

export const useChatSystem = (currentUser, isLoggedIn) => {
    // Friends System State
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]); // Received
    const [sentFriendRequests, setSentFriendRequests] = useState([]);

    // Chat System State
    const [activeChatFriend, setActiveChatFriend] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [ws, setWs] = useState(null);

    // Search State (kept here as it's related to finding friends)
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchResults, setUserSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // --- Friends Functions ---

    const fetchFriendsData = useCallback(async () => {
        if (!isLoggedIn) return;
        const token = localStorage.getItem('token');
        try {
            const [resFriends, resRec, resSent] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/friends`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_URL}/friends/requests/received`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${import.meta.env.VITE_API_URL}/friends/requests/sent`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (resFriends.ok) setFriends(await resFriends.json());
            if (resRec.ok) setFriendRequests(await resRec.json());
            if (resSent.ok) setSentFriendRequests(await resSent.json());
        } catch (e) {
            console.error("Failed to fetch friends data", e);
        }
    }, [isLoggedIn]);

    const searchUsers = async (query) => {
        if (!query) {
            setUserSearchResults([]);
            return;
        }
        setIsSearching(true);
        const token = localStorage.getItem('token');
        const trimmed = query.trim();
        const cleanQuery = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/search?query=${cleanQuery}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setUserSearchResults(data);
            }
        } catch (e) {
            console.error("Failed to search users", e);
        } finally {
            setIsSearching(false);
        }
    };

    const sendFriendRequest = async (userId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/friends/request/${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                alert("Friend request sent!");
                fetchFriendsData();
                setUserSearchResults([]);
                setUserSearchQuery('');
            } else {
                const data = await response.json();
                alert(data.message || "Failed to send request");
            }
        } catch (e) {
            console.error("Failed to send friend request", e);
        }
    };

    const respondToFriendRequest = async (requestId, action) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/friends/respond/${requestId}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchFriendsData();
            }
        } catch (e) {
            console.error(`Failed to ${action} friend request`, e);
        }
    };

    // --- Chat Functions ---

    const fetchChatHistory = useCallback(async (friendId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/history/${friendId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setChatMessages(await response.json());
            }
        } catch (e) {
            console.error("Failed to fetch chat history", e);
        }
    }, []);

    const handleSendMessage = (content) => {
        if (!content.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

        const message = {
            receiver_id: activeChatFriend.id,
            content: content
        };

        ws.send(JSON.stringify(message));
    };

    // --- Effects ---

    // Initial fetch and auto-refresh for friends
    useEffect(() => {
        if (isLoggedIn) {
            fetchFriendsData();
            const intervalId = setInterval(fetchFriendsData, 10000); // 10s refresh
            return () => clearInterval(intervalId);
        }
    }, [isLoggedIn, fetchFriendsData]);

    // WebSocket Connection logic moved to use Ref below to handle closure issues

    // Actually, we need to be careful with the WS dependency. 
    // If we put activeChatFriend in dependency, it reconnects every time we switch friends.
    // Better to use a ref for activeChatFriend inside the effect or just let it be global.
    // For simplicity now, let's keep it simple. The onmessage closure issue is real.
    // Let's fix the closure issue by using a ref for activeChatFriend.

    const activeChatFriendRef = useRef(activeChatFriend);
    useEffect(() => {
        activeChatFriendRef.current = activeChatFriend;
        if (activeChatFriend) {
            fetchChatHistory(activeChatFriend.id);
        }
    }, [activeChatFriend, fetchChatHistory]);

    // Re-implement WS effect to use Ref
    useEffect(() => {
        if (isLoggedIn && currentUser) {
            const token = localStorage.getItem('token');
            const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
            const socket = new WebSocket(`${wsUrl}/ws/chat/${currentUser.id}?token=${token}`);

            socket.onopen = () => {
                console.log("Connected to Chat WS");
            };

            socket.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                const currentActive = activeChatFriendRef.current;

                if (currentActive && (
                    (msg.sender_id === currentActive.id && msg.receiver_id === currentUser.id) ||
                    (msg.sender_id === currentUser.id && msg.receiver_id === currentActive.id)
                )) {
                    setChatMessages(prev => {
                        if (prev.some(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                }
            };

            setWs(socket);

            return () => {
                socket.close();
            };
        }
    }, [isLoggedIn, currentUser]);


    return {
        friends,
        friendRequests,
        sentFriendRequests,
        activeChatFriend,
        setActiveChatFriend,
        chatMessages,
        userSearchQuery,
        setUserSearchQuery,
        userSearchResults,
        isSearching,
        fetchFriendsData,
        searchUsers,
        sendFriendRequest,
        respondToFriendRequest,
        handleSendMessage
    };
};
