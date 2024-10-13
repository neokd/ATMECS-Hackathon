import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, CheckCircle, AlertCircle, ArrowUpCircle, GitBranch, Shield, Users, BadgeDollarSignIcon, ChevronDown, PauseIcon, ChevronsDown, FlameIcon, User } from 'lucide-react'; // Import relevant icons

function Monitoring() {
    const user_id = localStorage.getItem('user_id');
    const [decisions, setDecisions] = useState([]);
    const [selectedDecisions, setSelectedDecisions] = useState([]);
    const [selectedDecision, setSelectedDecision] = useState(null); // State for the currently selected decision

    useEffect(() => {
        const fetchDecisions = async () => {
            try {
                const response = await fetch(`/api/decisions?user_id=${user_id}`);
                const data = await response.json();
                setDecisions(data);
            } catch (error) {
                console.error('Error fetching decisions:', error);
            }
        };

        if (user_id) {
            fetchDecisions();
        }
    }, [user_id]);

    const handleCheckboxChange = (id) => {
        if (selectedDecisions.includes(id)) {
            setSelectedDecisions(selectedDecisions.filter((decisionId) => decisionId !== id));
        } else {
            setSelectedDecisions([...selectedDecisions, id]);
        }
    };

    const openModal = (decision) => {
        setSelectedDecision(decision); // Set the selected decision for the modal
    };

    const closeModal = () => {
        setSelectedDecision(null); // Reset the selected decision
    };

    // Function to render priority icon
    const renderPriorityIcon = (priority) => {
        switch (priority.toLowerCase()) {
            case 'high':
                return <FlameIcon className="text-red-500" size={32} />;
            case 'medium':
                return <PauseIcon className="text-yellow-500" size={32} />;
            case 'low':
                return <ChevronsDown className="text-blue-500" size={32} />;
            default:
                return null;
        }
    };

    // Function to render assigned team icon
    const renderAssignedTeamIcon = (assignedTo) => {
        switch (assignedTo.toLowerCase()) {
            case 'development':
                return <GitBranch className="text-blue-500" size={32} />;
            case 'security':
                return <Shield className="text-purple-500" size={32} />;
            case 'operations':
                return <Users className="text-teal-500" size={32} />;
            case 'sales':
                return <BadgeDollarSignIcon className="text-green-500 " size={32} />;
            case 'customer':
                return <User className="text-yellow-500" size={32} />;
            default:
                return null;
        }
    };

    // Function to style progress based on percentage
    const getProgressStyle = (progress) => {
        return progress >= 75
            ? 'bg-green-500 text-white'
            : 'bg-white dark:bg-gray-700 text-black dark:text-gray-300 rounded-full border border-green-500 dark:border-green-500';
    };

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }

    return (
        <div className="relative flex h-full w-full overflow-hidden">
            <Sidebar isExpanded={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex flex-col w-full h-screen relative transition-colors bg-[#18181b]">
                <div className="flex flex-col h-full dark:bg-[#222226] bg-white duration-100 rounded-3xl m-4">
                    <Navbar />
                    <div className="flex flex-col justify-center items-center w-full h-full p-4">
                        <div className="h-full max-h-[calc(95vh-160px)] md:max-h-[calc(95vh-180px)] overflow-y-auto scroll-smooth scrollbar-none mx-4">
                            <div className='space-y-4 w-full container'>
                                <h1 className="text-4xl  font-bold mb-12 dark:text-gray-200">Monitor the impact of AI decisions on business outcomes</h1>
                                <table className="min-w-full bg-white dark:bg-[#222226] border-none  text-center table-auto overflow-y-auto rounded-2xl shadow-lg">
                                    <thead className='dark:text-gray-100 text-lg bg-gray-200 '>
                                        <tr className=''>
                                            <th className="px-4 py-2 border dark:border-neutral-700">SNO</th>
                                            <th className="px-4 py-2 border dark:border-neutral-700">User Request</th>
                                            <th className="px-4 py-2 border dark:border-neutral-700">Suggestions & Action Items</th>
                                            <th className="px-4 py-2 border dark:border-neutral-700">Assigned</th>
                                            <th className="px-4 py-2 border dark:border-neutral-700">Status</th>
                                            <th className="px-4 py-2 border dark:border-neutral-700">Progress</th>
                                            <th className="px-4 py-2 border dark:border-neutral-700">Priority</th>
                                            <th className="px-4 py-2 border dark:border-neutral-700">Date</th>
                                            <th className="px-4 py-2 border dark:border-neutral-700">Due Date</th>

                                            <th className="px-4 py-2 border dark:border-neutral-700">Done</th>
                                        </tr>
                                    </thead>
                                    <tbody className='dark:text-gray-200 bg-gray-50 '>
                                        {decisions.map((decision) => (
                                            <tr key={decision.id}>
                                                <td className="px-4 py-2 border dark:border-neutral-700">{decision.id}</td>

                                                {/* User Query */}
                                                <td className="px-4 py-2 border dark:border-neutral-700 cursor-pointer">
                                                    <div className=" text-start max-h-24 overflow-hidden">
                                                        {decision.user_query}
                                                    </div>
                                                </td>

                                                {/* Decision Content */}
                                                <td
                                                    className="px-4 py-2 border dark:border-neutral-700 cursor-pointer text-start"
                                                    onClick={() => openModal(decision)} // Open modal on click
                                                >
                                                    <div className="lin max-h-24 overflow-hidden">
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
                                                                    return <li className="mb-2">{children}</li>;
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
                                                            {decision.decision_content}
                                                        </Markdown>
                                                    </div>
                                                </td>

                                                {/* Center the assigned team icon */}
                                                <td className="px-4 py-2 border dark:border-neutral-700">
                                                    <div className="flex justify-center items-center space-x-2">
                                                        {renderAssignedTeamIcon(decision.assigned_to)}
                                                        <span>{decision.assigned_to}</span>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-2 border dark:border-neutral-700">{decision.status}</td>

                                                {/* Center progress styling */}
                                                <td className={`px-4 py-2 border dark:border-neutral-700 text-center`}>
                                                    <button className={`rounded-2xl p-2 ${getProgressStyle(decision.progress)}`}>
                                                        {decision.progress}%
                                                    </button>
                                                </td>

                                                {/* Center the priority icon */}
                                                <td className="px-4 py-2 border dark:border-neutral-700">
                                                    <div className="flex justify-center items-center">
                                                        {renderPriorityIcon(decision.priority)}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-2 border dark:border-neutral-700 ">
                                                    {decision.created_at
                                                        ? new Date(decision.created_at.replace(' ', 'T').split('.')[0]).toLocaleString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: 'numeric',
                                                            second: 'numeric',
                                                            hour12: true
                                                        })
                                                        : 'N/A'}
                                                </td>

                                                <td className="px-4 py-2 border dark:border-neutral-700 ">
                                                    {decision.due_date
                                                        ? new Date(decision.due_date.replace(' ', 'T').split('.')[0]).toLocaleString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: 'numeric',
                                                            second: 'numeric',
                                                            hour12: true
                                                        })
                                                        : 'N/A'}
                                                </td>

                                                {/* Center the checkbox */}
                                                <td className="px-4 py-2 border dark:border-neutral-700 text-center">
                                                    <div className="flex justify-center items-center">
                                                        <input
                                                            type="checkbox"
                                                            className='cursor-pointer w-6 h-6 checked:bg-white accent-purple-500'
                                                            checked={selectedDecisions.includes(decision.id)}
                                                            onChange={() => handleCheckboxChange(decision.id)}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>


                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for selected decision */}
            {selectedDecision && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300 ease-in-out">
                    <div className="relative bg-white dark:bg-[#222226] h-1/2 p-8 rounded-2xl shadow-2xl max-w-3xl w-full mx-4 transform transition-transform duration-500 ease-in-out ">
                        <button
                            onClick={closeModal}
                            className="absolute -top-4 -right-4 p-2 text-gray-50 hover:text-gray-500 transition-colors bg-purple-500 rounded-full"
                        >
                            <X size={32} />
                        </button>
                        <div className="h-full overflow-y-auto scrollbar-none">
                            <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Selected Decision</h2>
                            <div className="flex justify-between items-center mb-4 divide-x-2 space-x-4 ">
                                <h3 className="text-lg font-semibold dark:text-gray-200">Decision Content: <span className='font-normal'>{selectedDecision.user_query}</span></h3>
                                <div className="flex flex-col items-center space-x-2 ">
                                    <h3 className="text-lg font-semibold dark:text-gray-200">Team:</h3>
                                    <button className="p-2   rounded-full">
                                        {renderAssignedTeamIcon(selectedDecision.assigned_to)}
                                        <span>{selectedDecision.assigned_to}</span>
                                    </button>
                                </div>
                            </div>
                            <div className='h-[1px] bg-gray-200 dark:bg-[#222526] mb-4'></div>

                            <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">Action Items & Suggestions</h3>
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
                                            <table className="table-auto border-collapse bg-white dark:bg-[#222526]/70 dark:border-neutral-600 border-2 border-gray-200  rounded-lg shadow-lg overflow-hidden">
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
                                {selectedDecision.decision_content}
                            </Markdown>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Monitoring;
