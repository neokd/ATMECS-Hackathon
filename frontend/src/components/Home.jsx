import React, { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import ChatInput from './ChatInput';
import MessageCard from './MessageCard';
import Notification from './Notification';

function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Hello! I am your virtual assistant. How can I help you today?',
  }]);
  const [loading, setLoading] = useState(false);
  const [sourceDocuments, setSourceDocuments] = useState([]);
  const [nextBestChoice, setNextBestChoice] = useState([]);
  const [orgType, setOrgType] = useState('retail');
  const [userOrg, setUserOrg] = useState('user');
  const [userSearch, setUserSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const chatEndRef = useRef(null);
  const sendNotification = (message) => {
    setNotifications((prev) => [...prev, message]); // Add a new notification
  };
  
  const scrollToBottom = () => {
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    }
};

useEffect(() => {
  scrollToBottom();
}, [messages]);

  const handleCloseNotification = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index)); // Remove notification by index
  };

  const sendMessageToServer = async (content) => {
    try {
      console.log('Sending message:', content);
      setLoading(true);
      const userMessage = { role: 'user', content };
      setMessages((prevMessages) => [...prevMessages, userMessage]); // Add user message immediately
      const userMessages = [...messages, userMessage];
      console.log(userMessages);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: userMessages }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let cumulativeContent = '';
      let isNewMessage = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const responseChunk = decoder.decode(value, { stream: true });
        // Process each line of the response
        responseChunk.split('\n').forEach((chunk) => {
          if (chunk.trim()) {
            try {
              const data = JSON.parse(chunk);
              if (data.type === 'response') {
                cumulativeContent += data.content;
                if (isNewMessage) {
                  setMessages((prevMessages) => [
                    ...prevMessages,
                    { role: 'assistant', content: cumulativeContent },
                  ]);
                  isNewMessage = false;
                } else {
                  setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[updatedMessages.length - 1].content = cumulativeContent;
                    return updatedMessages;
                  });
                }
              } else if (data.type === 'source_documents') {
                console.log(data.data);
                setSourceDocuments(data.data);
              } else if (data.type === 'next_best_actions') {
                setNextBestChoice(data.data);
              }
            } catch (error) {
              console.log('Error parsing JSON:', error);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false); // Ensure loading is turned off after processing
    }
  };

  const handleRegenerateMessage = () => {
    const lastMessage = messages[messages.length - 2];
    if (lastMessage && lastMessage.role === 'user') {
      sendMessageToServer(lastMessage.content); // Send request to regenerate last assistant message
    }
  };
  

  useEffect(() => {
    if (messages.length === 0 && userSearch) {
      sendMessageToServer(userSearch);
    }
  }, [userSearch, messages.length]);

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar isExpanded={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content area */}
      <div className="flex flex-col w-full h-screen relative transition-colors bg-[#18181b]">
        {/* Navbar */}

        <div className="flex flex-col h-full dark:bg-[#222226] bg-white duration-100 rounded-3xl m-4">
          <Navbar />
          {/* Centering container */}
          <div className="flex flex-col justify-center items-center w-full h-full p-4">
            {/* Messages area */}
            <div className="h-full max-h-[calc(95vh-160px)] md:max-h-[calc(95vh-180px)] overflow-y-auto scroll-smooth scrollbar-none  mx-4 ">
              <div className='space-y-4 w-full  max-w-[1200px]'>
                {messages.map((msg, index) => (
                  <MessageCard
                    key={index}
                    content={msg.content}
                    role={msg.role}
                    onRegenerate={handleRegenerateMessage}
                    nextBestChoice={nextBestChoice}
                    lastMessageIndex={index === messages.length - 1 && msg.role === 'assistant'}
                    sendMessage={sendMessageToServer}
                    sourceDocuments={sourceDocuments}

                    sendNotification={sendNotification}
                  />
                ))}
              </div>
              {notifications.map((message, index) => (
                <Notification
                  key={index}
                  message={message}
                  onClose={() => handleCloseNotification(index)}
                />
              ))}
               <div ref={chatEndRef} className="h-0" />

            </div>

            {/* Chat input stuck at the bottom */}
            <div className="flex-shrink-0 w-full max-w-[1200px]">
              <ChatInput sendMessage={sendMessageToServer} sendImage={ {} } sendNotification={sendNotification} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
