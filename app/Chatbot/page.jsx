'use client'

import { Box, Button, Stack, TextField, Avatar, IconButton } from '@mui/material'
import SendIcon from '@mui/icons-material/Send';
import { useEffect, useRef, useState } from 'react'
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import ProfileIcon from './profile-svgrepo-com.svg';

const Chatbot = () => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "Hi! I'm the Headstarter support assistant. How can I help you today?",
        },
    ]);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    
    const {data: session} = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/api/auth/signin?callbackUrl=/Chatbot");
        },
    });

    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;
        setIsLoading(true)
        
        setMessage('')
        setMessages((messages) => [
            ...messages,
            { role: 'user', content: message },
            { role: 'assistant', content: '' },
        ])
        
        try {
            const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([...messages, { role: 'user', content: message }]),
            })
        
            if (!response.ok) {
            throw new Error('Network response was not ok')
            }
        
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
        
            while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const text = decoder.decode(value, { stream: true })
            setMessages((messages) => {
                let lastMessage = messages[messages.length - 1]
                let otherMessages = messages.slice(0, messages.length - 1)
                return [
                ...otherMessages,
                { ...lastMessage, content: lastMessage.content + text },
                ]
            })
        }

        setIsLoading(false)
        } catch (error) {
            console.error('Error:', error)
            setMessages((messages) => [
            ...messages,
            { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
            ])
        }
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            sendMessage()
        }
    }

    const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <Box
      maxWidth="100vw"
      minHeight="90vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      backgroundColor="#dbdcdc"
      sx={{
        padding: 2,
      }}
    >
      <Stack
        direction={"column"}
        width={{ xs: "90%", sm: "1000px" }}
        height={{ xs: "80vh", sm: "600px" }}
        borderRadius={2}
        boxShadow={3}
        p={3}
        spacing={3}
        bgcolor="black"
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          p={3}
          overflow="auto"
          maxHeight="100%"
          sx={{
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#333",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#555",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#777",
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
              alignItems="center"
            >
              {message.role === "assistant" && (
                <Avatar
                  src={message.profilePic}
                  alt="Assistant"
                  sx={{ marginRight: 1 }}
                />
              )}
              <Box
                sx={{
                  backgroundColor:
                    message.role === "assistant" ? "#333" : "#005bb5",
                  color: "white",
                  borderRadius: "12px",
                  p: 2,
                  maxWidth: "80%",
                }}
              >
                {message.content}
              </Box>
              {message.role === "user" && (
                <Avatar
                  src={ProfileIcon}
                  alt="User"
                  sx={{ marginLeft: 1 }}
                />
              )}
            </Box>
          ))}
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <TextField
            placeholder="Type your message..."
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            // disabled={loading}
            variant="outlined"
            InputProps={{
              sx: {
                borderRadius: 2,
                backgroundColor: "#333",
                color: "#fff",
              },
            }}
            InputLabelProps={{
              sx: { color: "#777" },
              borderColor: "transparent",
            }}
          />
          <IconButton
            onClick={sendMessage}
            sx={{
              borderRadius: 50,
              color: "#fff",
            }}
          >
            <SendIcon></SendIcon>
          </IconButton>
        </Stack>
      </Stack>
    </Box>
    );
}

export default Chatbot;