import { PanelRightOpen, PanelRightClose, Search, CalendarCheck2, ScanText, Settings, MoonIcon, Sun, LogOut, Plus, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import { useState, useEffect } from 'react';
function Sidebar({ isExpanded, toggleSidebar }) {
    const navigate = useNavigate();
    const logOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
        navigate('/login');
    }


    return (
        <div
            className={`fixed top-0 left-0 z-50 h-screen  bg-[#141617] shadow-lg  border-gray-900 transition-transform duration-300 ease-in-out ${isExpanded ? 'translate-x-0' : '-translate-x-full'
                } md:relative md:translate-x-0 w-64 lg:w-auto`}
        >
            {/* Sidebar */}
            <aside className={`flex flex-col items-start justify-start ${isExpanded ? 'w-64' : 'w-16'} h-full shadow-lg transition-all duration-300 ease-in-out`}>
                <div className={`flex mt-4 transition-all duration-500 ease-in-out ${isExpanded ? 'justify-center items-center space-x-4 mx-auto' : 'mx-2'}`}>
                    <h1 className={`text-center  text-gray-50 text-3xl font-bold transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'ml-4 scale-110'}`}>
                        {isExpanded ? 'RS BOT' : 'RS'}
                    </h1>
                </div>
                

                <div className="mt-8 w-full">
                    <Icon icon={Plus} color="text-gray-200" text="New Chat" isExpanded={isExpanded} navigate={navigate} route="/chat" />
                    <Icon icon={LayoutDashboard} color="text-gray-200" text="Dashboard" isExpanded={isExpanded} navigate={navigate} route="/dashboard" />
                </div>

                {/* <div className={`absolute bottom-16 transform mx-2 border border-neutral-700 rounded-lg divide-gray-500 transition-all duration-100 ease-in-out group flex ${isExpanded ? 'w-auto p-1' : 'justify-center'}`}>
                    {isExpanded ? (
                        <>
                            <button
                                onClick={logOut}
                                className={`flex flex-row items-center justify-center px-4 py-2 rounded-lg text-gray-300 hover:text-white transition-all duration-700 ease-in-out transform `}
                            >
                                <LogOut size={24} className="text-gray-200" />
                                Logout
                            </button>
                           
                        </>
                    ) : (
                        <button
                            onClick={logOut}
                            className="flex items-center justify-center w-12 h-12 rounded-lg text-gray-300 hover:text-white bg-[#141617] transition-all duration-500 ease-in-out"
                        >
                           <LogOut size={24} className="text-gray-200" />
                        </button>
                    )}
                </div> */}

                {/* Sidebar toggle button */}
                <div className={`absolute bottom-4 transform mx-4 transition-all duration-300 ${isExpanded ? 'flex flex-row gap-4' : 'flex flex-col items-center gap-4'}`}>
                    {/* Toggle Sidebar Button */}
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

                    {/* Logout Button */}
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
const Icon = ({ icon: Icon, color, text, isExpanded, navigate, route }) => (
    <div className="flex mb-3 w-full">
        <button
            className="flex items-center w-full px-4 py-2 duration-300 hover:bg-[#333438]/70 focus:outline-none transform hover:scale-95 rounded-lg transition-transform bg-gray-800 mx-2"
            onClick={() => navigate(route)}
        >
            <Icon className={` ${color} text-2xl`} />
            <span className={`ml-2 text-gray-100 ${isExpanded ? 'opacity-100' : 'opacity-0 hidden'} transition-opacity duration-300 text-lg `}>
                {text}
            </span>
        </button>
    </div>
);

export default Sidebar;