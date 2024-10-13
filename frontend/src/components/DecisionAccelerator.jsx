import { useState, useEffect, useRef } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { BookmarkCheck, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Notification from './Notification';


const DropdownButton = ({ selected, setSelected, options, isOpen, setIsOpen }) => {
    const handleSelect = (value) => {
        setSelected(value);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block">
            <button
                type="button"
                className="flex items-center justify-center text-sm px-4 h-8 font-medium rounded-lg bg-purple-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300 hover:bg-purple-300 mx-2 mb-2 dark:hover:bg-gray-600 transition duration-300 ease-in-out focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selected}
                <svg className="w-4 h-4 ml-2" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M5 8l5 5 5-5H5z" fill="currentColor" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-10 grid grid-cols-2 mt-1 w-full bg-white dark:bg-gray-800 border border-neutral-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="p-2 text-gray-900 dark:text-gray-300 hover:bg-purple-200 dark:hover:bg-gray-600 cursor-pointer"
                            onClick={() => handleSelect(option.label)}
                        >
                            {option.label}
                            <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
const DecisionAccelerator = () => {
    const [message, setMessage] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedPerspective, setSelectedPerspective] = useState("General Perspective");
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [apiResponse, setApiResponse] = useState('');
    const options = [
        { value: "0", label: "General Perspective", description: "Get a general overview of the business scenario." },
        { value: "1", label: "Sales Perspective", description: "Gain insights on sales strategies and performance." },
        { value: "2", label: "Financial Perspective", description: "Analyze financial metrics and implications." },
        { value: "3", label: "Operational Perspective", description: "Evaluate the efficiency of operational processes." },
        { value: "4", label: "Technological Perspective", description: "Assess the role of technology in enhancing business outcomes." },
        // Add more options as needed
    ];
    const chatScrollRef = useRef();

    useEffect(() => {
        if (apiResponse && chatScrollRef.current) {
            chatScrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [apiResponse]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiResponse(''); // Clear previous response

        const response = await fetch('/api/perspective', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: message, persona: selectedPerspective }), // Send both message and selected perspective
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            try {
                const data = JSON.parse(decoder.decode(value, { stream: true }));
                if (data.type === 'response') {
                    setApiResponse(prev => prev + data.content);
                }
            } catch (err) {
                console.error('Error parsing response:', err);
            }

        }
    };

    const handleBookmark = async () => {
        const response = await fetch('/api/tracking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: apiResponse, user_id: localStorage.getItem("user_id"), user_query: message, persona: selectedPerspective }),
        });
        if (!response.ok) {
            setNotifications((prev) => [...prev, 'Failed to record your decision.']);
        }
        setNotifications((prev) => [...prev, 'Your decision is been recorded for future monitoring.']);

    };

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    const handleCloseNotification = (index) => {
        setNotifications((prev) => prev.filter((_, i) => i !== index)); // Remove notification by index
    };

    return (
        <div className="relative flex h-full w-full overflow-hidden">
            {/* Sidebar */}
            <Sidebar isExpanded={isExpanded} toggleSidebar={toggleSidebar} />

            {/* Main content area */}
            <div className="flex flex-col w-full h-screen relative transition-colors bg-[#18181b]">
                {/* Navbar */}
                <div className="flex flex-col h-full dark:bg-[#222226] bg-white duration-100 rounded-3xl m-4">
                    <Navbar />
                    <h1 className="text-4xl md:text-6xl font-semibold text-center flex items-center justify-center leading-[4rem] dark:text-gray-50 mb-3 mt-12">
                        Describe a business scenario to get started...
                    </h1>

                    <form onSubmit={handleSubmit} className="w-full max-w-screen-lg h-72 pt-4 flex items-center mx-auto ">
                        <div className={`flex flex-col bg-light-secondary dark:bg-dark-secondary focus:outline-1 outline-gray-800 border border-neutral-600 rounded-lg w-full shadow-lg relative ${charCount >= 2000 ? 'border-2 border-red-500' : ''}`}>
                            <TextareaAutosize
                                value={message}
                                minRows={6}
                                maxRows={10}
                                maxLength={2000}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    setCharCount(e.target.value.length);
                                }}
                                className="w-full h-72 resize-none border-none outline-none bg-transparent dark:border-neutral-700 placeholder-gray-500 dark:placeholder:text-gray-200 dark:caret-gray-200 dark:text-gray-50 p-2"
                                placeholder="Type a message..."
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e); } }}
                            />
                            <DropdownButton
                                selected={selectedPerspective}
                                setSelected={setSelectedPerspective}
                                options={options}
                                isOpen={isOpen}
                                setIsOpen={setIsOpen}
                            />
                            <button
                                type="submit"
                                disabled={message.trim().length === 0}
                                className={`bg-purple-500 w-10 h-10 text-white hover:bg-opacity-85 transition duration-100 rounded-full p-2 absolute bottom-2 right-2 ${message.trim().length === 0 ? 'opacity-50' : 'opacity-85'}`}
                            >
                                <Search />
                            </button>
                        </div>
                    </form>
                    <div className="text-gray-500 mb-4 flex mx-auto ">
                        Character Count: {charCount}/2000
                    </div>

                    {apiResponse && (
                        <div className="w-full p-4 dark:bg-[#141617] bg-[#f2f5f7] rounded-lg dark:text-gray-200 max-w-[72rem] mx-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-semibold">Action Items & Recommendations</h2>
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={handleBookmark}
                                        className="bg-purple-400/90 hover:bg-purple-500 text-white p-2 rounded-lg hover:bg-opacity-85 transition duration-100"
                                    >
                                        <BookmarkCheck size={20} />
                                    </button>
                                    <button
                                        onClick={() => setApiResponse('')}
                                        className="bg-purple-400/90 hover:bg-purple-500 text-white p-2 rounded-lg hover:bg-opacity-85 transition duration-100"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className='overflow-y-auto max-h-[28rem]'> {/* Adjust max-h to control height */}
                                <Markdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        code({ node, inline, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    style={prism}
                                                    language={match[1]}
                                                    PreTag="pre"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        p({ children }) {
                                            return <p className="mb-2">{children}</p>;
                                        },
                                        ul({ children }) {
                                            return <ul className="list-decimal pl-8">{children}</ul>;
                                        },
                                        ol({ children }) {
                                            return <ol className="list-disc pl-8">{children}</ol>;
                                        },
                                        li({ children }) {
                                            return <li className="mb-2 ">{children}</li>;
                                        },
                                        dl({ children }) {
                                            return <dl>{children}</dl>;
                                        },
                                        table({ children }) {
                                            return (
                                                <table className="table-auto border-collapse bg-white dark:bg-[#222526]/70 dark:border-neutral-600 border-2 border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                    {children}
                                                </table>
                                            );
                                        },
                                        tr({ children }) {
                                            return <tr className="border-collapse border-b-2 border-gray-200 dark:border-neutral-600">{children}</tr>;
                                        },
                                        th({ children }) {
                                            return (
                                                <th className="p-2 border-collapse border-2 border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-[#222526] rounded-lg">
                                                    {children}
                                                </th>
                                            );
                                        },
                                        td({ children }) {
                                            return (
                                                <td className="p-2 border-collapse border-2 border-gray-200 dark:border-neutral-600 text-center">
                                                    {children}
                                                </td>
                                            );
                                        },
                                        blockquote({ children }) {
                                            return <blockquote className="border-l-4 border-sky-500 p-2">{children}</blockquote>;
                                        }
                                    }}
                                >
                                    {apiResponse}
                                </Markdown>
                                <div ref={chatScrollRef} />
                            </div>
                        </div>
                    )}
                    {notifications.map((message, index) => (
                        <Notification
                            key={index}
                            message={message}
                            onClose={() => handleCloseNotification(index)}
                        />
                    ))}

                </div>
            </div>
        </div>
    );
};

export default DecisionAccelerator;