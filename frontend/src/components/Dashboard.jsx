import React, { useState } from 'react'
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { File, Grid, Users } from 'lucide-react';

function Dashboard() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const username = localStorage.getItem('username');

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
                    <div className="flex flex-col  w-full h-full p-4">
                        {/* Messages area */}
                        <div className="h-full max-h-[calc(95vh-160px)] md:max-h-[calc(95vh-180px)] overflow-y-auto scroll-smooth scrollbar-none  mx-4 ">
                            <div className='space-y-4 w-full '>
                                <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-50 mb-12">Welcome {username}</h1>
                                {/* A card like layout that will be used to how 3 main important stats  */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="bg-gray-100 dark:bg-[#19191c] p-4 rounded-lg shadow-lg flex justify-between items-center border-2">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Total Documents</h1>
                                            <p className="text-2xl text-gray-800 dark:text-gray-300">100</p>
                                        </div>
                                        <File className="text-gray-800 dark:text-gray-200 text-3xl" size={48} />
                                    </div>
                                    <div className="bg-gray-100 dark:bg-[#19191c] p-4 rounded-lg shadow-md flex justify-between items-center border-2">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Total Chunks</h1>
                                            <p className="text-2xl text-gray-800 dark:text-gray-300">100</p>
                                        </div>
                                        <Grid className="text-gray-800 dark:text-gray-200 text-3xl" size={48} />
                                    </div>
                                    <div className="bg-gray-100 dark:bg-[#19191c] p-4 rounded-lg shadow-md flex justify-between items-center border-2">
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Total Users</h1>
                                            <p className="text-2xl text-gray-800 dark:text-gray-300">100</p>
                                        </div>
                                        <Users className="text-gray-800 dark:text-gray-200 text-3xl" size={48} />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default Dashboard
