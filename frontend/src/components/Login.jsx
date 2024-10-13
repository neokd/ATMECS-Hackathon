import { LockKeyhole, UserRound } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigateTo = useNavigate()
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            setMessage(data.message);
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('user_id', data.user_id);
                navigateTo('/home');
            }
        } catch (error) {
            setMessage('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex justify-center items-center ">
                {/* <h2 className="text-6xl font-extrabold text-center ">Welcome Back</h2> */}
            </div>

            {/* <h1 className="text-4xl font-bold text-center mb-6">Welcome to Synergy Platform 🔍</h1> */}
            <div className="w-[32rem] p-6 rounded-xl mt-4 space-y-6 bg-white border-2 shadow-xl hover:shadow-lg hover:shadow-purple-500 duration-500">
                <h2 className="text-3xl font-bold text-center">Login</h2>
                <form onSubmit={handleLogin} className="flex flex-col space-y-4">
                    <div className="relative">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="border-2 border-gray-400 rounded-md p-3 pl-10 w-full" // Add padding-left for the icon
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <UserRound size={24} className="absolute left-3 top-1/2 transform -translate-y-1/2 rounded-full" /> {/* Adjust icon size and position */}
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Enter your password"
                            className="border-2 border-gray-400 rounded-md p-3 pl-10 w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <LockKeyhole size={24} className="absolute left-3 top-1/2 transform -translate-y-1/2" /> {/* Adjust icon size and position */}
                    </div>
                    <div className="flex justify-between mt-2">
                        <a href="/forgot-password" className="text-sm text-blue-500 hover:underline">
                            Forgot password?
                        </a>
                        <a href="/signup" className="text-sm text-blue-500 hover:underline ml-4">
                            Create an account
                        </a>
                    </div>
                    <button type="submit" className="outline outline-blue-500 duration-300 hover:bg-blue-500 hover:text-white rounded-md text-lg p-3 w-full mt-6">
                        Login
                    </button>
                </form>
                {message && <p className="mt-4 text-red-500 text-center">{message}</p>}
            </div>
        </div>
    );
};

export default Login;