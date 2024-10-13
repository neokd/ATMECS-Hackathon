import { PanelRightOpen, PanelRightClose, LogOut, Plus, LayoutDashboard, Home, SquareActivity, BotMessageSquare, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

function Sidebar({ isExpanded, toggleSidebar }) {
    const navigate = useNavigate();
    const location = useLocation(); // Get current location
    const logOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    const chatHistory = [
        {
            id: 1,
            title: 'Inquiry about Company Services',
            summary: 'User wants to know the range of services offered by the company, including specific solutions related to AI and automation.'
        },
        {
            id: 2,
            title: 'Understanding AI Solutions',
            summary: 'User is interested in a detailed explanation of how the company’s AI solutions function and their practical applications.'
        },
        {
            id: 3,
            title: 'Industry Specializations',
            summary: 'User is inquiring about the industries that the company specializes in and how their services cater to different sectors.'
        },
        {
            id: 4,
            title: 'Support Team Contact',
            summary: 'User is looking for information on how to reach the company’s support team for assistance with a product or service.'
        },
        {
            id: 5,
            title: 'Training for Software Products',
            summary: 'User is interested in knowing whether the company offers training sessions for their software products and how to enroll.'
        },
    ];


    return (
        <div
            className={`fixed top-0 left-0 z-50 h-screen bg-[#141617] shadow-lg border-gray-900 transition-transform duration-300 ease-in-out ${isExpanded ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 w-64 lg:w-auto`}
        >
            <aside className={`flex flex-col items-start justify-start ${isExpanded ? 'w-64' : 'w-16'} h-full shadow-lg transition-all duration-300 ease-in-out`}>
                <div className={`flex mt-8 transition-all duration-500 ease-in-out ${isExpanded ? 'justify-center items-center space-x-4 mx-auto' : 'mx-2'}`}>
                    <h1 className={`text-center text-gray-50 text-2xl font-bold transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'ml-4 scale-110'}`}>
                        {isExpanded ? 'RS Enterprise RAG' : 'RS'}
                    </h1>
                </div>
                <div className="mt-8 w-full">
                    <Icon icon={Home} color="text-sky-500" text="Home" isExpanded={isExpanded} navigate={navigate} route="/home" isActive={location.pathname === '/home'} />
                    <Icon icon={LayoutDashboard} color="text-lime-500" text="Dashboard" isExpanded={isExpanded} navigate={navigate} route="/dashboard" isActive={location.pathname === '/dashboard'} />
                    <Icon icon={Zap} color="text-yellow-500" text="Decision Accelerator" isExpanded={isExpanded} navigate={navigate} route="/da" isActive={location.pathname === '/da'} />
                    <Icon icon={BotMessageSquare} color="text-purple-500" text="Q&A Bot" isExpanded={isExpanded} navigate={navigate} route="/chat" isActive={location.pathname === '/chat'} />

                    <Icon icon={SquareActivity} color="text-pink-500" text="Track" isExpanded={isExpanded} navigate={navigate} route="/track" isActive={location.pathname === '/track'} />

                </div>
                <div className='mt-4 w-full '>
                  
                    {
                        location.pathname === '/chat' && (
                            <>
                              <div className='h-0.5 mb-4 w-full bg-gray-500'></div>
                            <h3 className="text-gray-100 font-bold text-lg mx-2 mb-4">Chat History</h3>
                            {
                                location.pathname === '/chat' && chatHistory.map((chat) => (
                                    <div key={chat.id} className="flex flex-col p-2 bg-[#333438]/70 rounded-lg mb-4 mx-2">
                                        <h2 className="text-gray-100 font-bold line-clamp-1">{chat.title}</h2>
                                    </div>
                                ))
                            }
                            </>
                        )
                    }
                      
                </div>
                <div className={`absolute bottom-4 transform mx-4 transition-all duration-300 ${isExpanded ? 'flex flex-row gap-4' : 'flex flex-col items-center gap-4'}`}>
                    <button
                        className="rounded-md p-2 transition-transform duration-300 group hover:scale-105 border border-gray-500"
                        onClick={toggleSidebar}
                    >
                        {isExpanded ? (
                            <>
                                <PanelRightOpen className="text-gray-200" />
                                <span className="absolute top-1/2 left-full -translate-y-1/2 translate-x-2 scale-0 group-hover:scale-100 transition-all bg-purple-500 p-2 rounded text-white text-xs">
                                    Close
                                </span>
                            </>
                        ) : (
                            <>
                                <PanelRightClose className="text-gray-200" />
                                <span className="absolute top-1/2 left-full -translate-y-1/2 translate-x-2 scale-0 group-hover:scale-100 transition-all bg-purple-500 p-2 rounded text-white text-xs">
                                    Expand
                                </span>
                            </>
                        )}
                    </button>
                    <button
                        className="rounded-md p-2 transition-transform duration-300 group hover:scale-105 border border-gray-500"
                        onClick={logOut}
                    >
                        <LogOut className="text-gray-200" />
                        <span className={`absolute top-1/2 left-full -translate-y-1/2 translate-x-2 scale-0 group-hover:scale-100 transition-all bg-purple-500 p-2 rounded text-white text-xs`}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>
        </div>
    );
}

// Component for rendering icons with text when expanded
const Icon = ({ icon: Icon, color, text, isExpanded, navigate, route, isActive }) => (
    <div className="flex mb-3 w-full">
        <button
            className={`flex items-center w-full px-4 py-2 duration-300 hover:bg-[#333438]/70 focus:outline-none transform hover:scale-95 rounded-lg transition-transform  mx-2 ${isActive ? 'bg-[#222226]' : ''}`} // Add conditional class for active state
            onClick={() => navigate(route)}
        >
            <Icon className={` ${color} text-3xl`} />
            <span className={`ml-2 text-gray-100 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'} transition-opacity duration-300 text-lg `}>
                {text}
            </span>
        </button>
    </div>
);

export default Sidebar;
