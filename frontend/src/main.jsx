import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from './components/Login.jsx';
import SignUp from './components/Signup.jsx';
import Home from './components/Home.jsx';
import Dashboard from './components/Dashboard.jsx';
import SearchChat from './components/SearchChat.jsx';
import DecisionAccelerator from './components/DecisionAccelerator.jsx';
import Monitoring from './components/Monitoring.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp/>,
  },
  {
    path: "/home",
    element: <SearchChat />,
  },
  {
    path: "/da",
    element: <DecisionAccelerator />,
  },
  {
    path:"/track",
    element: <Monitoring />,
  },
  {
    path: "/chat",
    element: <Home />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  }
]);


createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />,
)
