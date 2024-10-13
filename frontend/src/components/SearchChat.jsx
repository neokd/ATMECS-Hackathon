import { useState, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Activity, Battery, BotMessageSquare, Boxes, BrainCircuit, Briefcase, ChartNoAxesCombined, DiamondPercent, FileText, Gem, Globe, Search, ServerCog, TrendingUp, Trophy, Watch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Typewriter from 'typewriter-effect';

const SearchChat = () => {
    const [message, setMessage] = useState('');
    const [charCount, setCharCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const navigateTo = useNavigate();



    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(message);
        navigateTo('/chat', { state: { message } });
    };


    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    }

    return (
        <div className="relative flex h-full w-full overflow-hidden">
            {/* Sidebar */}
            <Sidebar isExpanded={isExpanded} toggleSidebar={toggleSidebar} />

            {/* Main content area */}
            <div className="flex flex-col w-full h-screen relative transition-colors bg-[#18181b]">
                {/* Navbar */}
                <div className="flex flex-col h-full dark:bg-[#222226] bg-white duration-100 rounded-3xl m-4">
                    <Navbar />
                    <div className="flex flex-col items-center space-y-6 m-auto">

                        <h1 className="text-4xl md:text-8xl font-semibold text-center flex items-center max-w-[94rem] justify-center leading-[4rem] dark:text-gray-50 mb-3">
                            {/* <img src="/Synerylogofinal.png" alt="Synergy" className='w-20 h-20 mr-4 border rounded-full border-none ' /> */}

                            Strategic Business Intelligence for Enterprises.

                        </h1>
                        {/* <h1 className="text-4xl  text-center flex items-center justify-center text-neutral-900 dark:text-gray-50 mb-4">"</h1> */}
                        <blockquote className="relative text-2xl md:text-4xl ml-8 md:m-0">
                            <svg className="absolute -top-6 -start-8 size-16 text-gray-300 dark:text-neutral-700" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M7.39762 10.3C7.39762 11.0733 7.14888 11.7 6.6514 12.18C6.15392 12.6333 5.52552 12.86 4.76621 12.86C3.84979 12.86 3.09047 12.5533 2.48825 11.94C1.91222 11.3266 1.62421 10.4467 1.62421 9.29999C1.62421 8.07332 1.96459 6.87332 2.64535 5.69999C3.35231 4.49999 4.33418 3.55332 5.59098 2.85999L6.4943 4.25999C5.81354 4.73999 5.26369 5.27332 4.84476 5.85999C4.45201 6.44666 4.19017 7.12666 4.05926 7.89999C4.29491 7.79332 4.56983 7.73999 4.88403 7.73999C5.61716 7.73999 6.21938 7.97999 6.69067 8.45999C7.16197 8.93999 7.39762 9.55333 7.39762 10.3ZM14.6242 10.3C14.6242 11.0733 14.3755 11.7 13.878 12.18C13.3805 12.6333 12.7521 12.86 11.9928 12.86C11.0764 12.86 10.3171 12.5533 9.71484 11.94C9.13881 11.3266 8.85079 10.4467 8.85079 9.29999C8.85079 8.07332 9.19117 6.87332 9.87194 5.69999C10.5789 4.49999 11.5608 3.55332 12.8176 2.85999L13.7209 4.25999C13.0401 4.73999 12.4903 5.27332 12.0713 5.85999C11.6786 6.44666 11.4168 7.12666 11.2858 7.89999C11.5215 7.79332 11.7964 7.73999 12.1106 7.73999C12.8437 7.73999 13.446 7.97999 13.9173 8.45999C14.3886 8.93999 14.6242 9.55333 14.6242 10.3Z" fill="currentColor"></path>
                            </svg>

                            <div className="relative z-10">
                                <p className="text-gray-800  dark:text-neutral-100 font-sans"><em>
                                    <Typewriter
                                        onInit={(typewriter) => {
                                            typewriter.typeString('Transform Business Process and Decision-Making with Generative AI!')
                                                .callFunction(() => {
                                                    console.log('String typed out!');
                                                })
                                                .pauseFor(2500)
                                                .start();        
                                                
                                        }}
                                        options={{
                                            autoStart: true,
                                            delay: 50,
                                        }}
                                    />
                                </em></p>
                            </div>
                        </blockquote>

                        {/* 
                    <form onSubmit={handleSubmit} className="w-full max-w-screen-sm pt-8 pb-6">
                        <div className={`flex flex-col bg-light-secondary dark:bg-dark-secondary focus:outline-1 outline-gray-800 border border-neutral-600 rounded-lg w-full shadow-lg  relative ${charCount >= 2000 ? 'border-2 border-red-500' : 'border border-red'}`}>
                            <TextareaAutosize
                                value={message}
                                minRows={5}
                                maxRows={7}
                                maxLength={2000}
                                onChange={(e) => setMessage(e.target.value) || setCharCount(e.target.value.length)}
                                className="w-full h-auto resize-none border-none outline-none focus:outline-none bg-transparent dark:border-neutral-700 placeholder-gray-500 dark:placeholder:text-gray-200 dark:caret-gray-200 dark:text-gray-50 p-2 "
                                placeholder="Type a message..."
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e); } }}
                            />
                            <div className="absolute  bottom-0 left-2 text-gray-900 dark:text-gray-300 text-sm">
                                {charCount}/2000
                            </div>
                            <button
                                type="submit"
                                disabled={message.trim().length === 0}
                                className={`bg-purple-500 w-10 h-10 text-white hover:bg-opacity-85 transition duration-100 rounded-full p-2 absolute bottom-2 right-2 ${message.trim().length === 0 ? 'opacity-50' : 'opacity-85'}`}
                            >
                                <Search />
                            </button>
                        </div>
                    </form> */}

                        <div className="w-full max-w-4xl mx-auto  ">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
                                <a href='/da' className="group flex items-center    rounded-xl transition-all hover:border-transparent hover:shadow-[0_0_1rem_0.25rem_rgba(0,0,0,0.04),0px_2rem_1.5rem_-1rem_rgba(0,0,0,0.12)] p-2 lg:p-4 flex-row justify-start space-x-4 bg-white dark:bg-[#222526] dark:hover:bg-[#141617]   shadow-md border border-neutral-600">
                                    <div className="bg-[#e7dcfa] dark:bg-[#392f4f] p-4 rounded-lg flex items-center justify-center">
                                        <BrainCircuit size={36} className="text-purple-700 dark:text-purple-500" />
                                    </div>
                                    <span className="text-lg font-medium dark:text-gray-200">Decisions Accelerator</span>
                                </a>
                                <a href='/chat' className="group flex items-center    rounded-xl transition-all hover:border-transparent hover:shadow-[0_0_1rem_0.25rem_rgba(0,0,0,0.04),0px_2rem_1.5rem_-1rem_rgba(0,0,0,0.12)] p-2  lg:p-4 flex-row justify-start space-x-4 bg-white dark:bg-[#222526] dark:hover:bg-[#141617]   shadow-md border border-neutral-600">
                                    <div className="bg-[#f5dad0] dark:bg-[#472e25] p-4 rounded-lg flex items-center justify-center">
                                        <BotMessageSquare size={36} className="text-orange-700 dark:text-orange-500" />
                                    </div>
                                    <span className="text-lg font-medium dark:text-gray-200">Roburst Q&A</span>
                                </a>
                                <a href='/dashboard' className="group flex items-center   rounded-xl transition-all hover:border-transparent hover:shadow-[0_0_1rem_0.25rem_rgba(0,0,0,0.04),0px_2rem_1.5rem_-1rem_rgba(0,0,0,0.12)] p-2  lg:p-4 flex-row justify-start space-x-4 bg-white dark:bg-[#222526] dark:hover:bg-[#141617]   shadow-md border border-neutral-600">

                                    <div className="bg-[#cce6ff] dark:bg-[#1f3952] p-4 rounded-lg flex items-center justify-center">
                                        <ChartNoAxesCombined size={36} className="text-blue-500 dark:text-blue-500" />
                                    </div>
                                    <span className="text-lg font-medium dark:text-gray-200">Interactive Dashboard</span>
                                </a>
                                <a href='/track' className="group flex items-center   rounded-xl transition-all hover:border-transparent hover:shadow-[0_0_1rem_0.25rem_rgba(0,0,0,0.04),0px_2rem_1.5rem_-1rem_rgba(0,0,0,0.12)] p-2  lg:p-4 flex-row justify-start space-x-4 bg-white dark:bg-[#222526] dark:hover:bg-[#141617]   shadow-md border border-neutral-600">
                                    <div className="bg-[#daf2e0] dark:bg-[#2d4536] p-4 rounded-lg flex items-center justify-center">
                                        <Activity size={36} className="text-green-700 dark:text-green-600" />
                                    </div>
                                    <span className="text-lg font-medium dark:text-gray-200">Realtime Tracking</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchChat;