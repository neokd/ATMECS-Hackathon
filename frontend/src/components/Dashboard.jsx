import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Boxes, ChartColumnIncreasing, ClockArrowUp, File } from 'lucide-react';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import Chart from "chart.js/auto";
import { CategoryScale, scales } from "chart.js";

function Dashboard() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
    const [cardData, setCardData] = useState([]);
    const username = localStorage.getItem('username');

    // Fetch data from /api/dashboard and display it in the dashboard
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/dashboard', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await response.json();
                setCardData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // Prepare the Doughnut chart data from financial_data
    const financialData = cardData.financial_data || [];
    const totalSales = financialData.reduce((acc, curr) => acc + curr.sales, 0);
    const totalExpenses = financialData.reduce((acc, curr) => acc + curr.expenses, 0);
    const totalNetProfit = financialData.reduce((acc, curr) => acc + curr.net_profit, 0);
    const operatingProfit = financialData.reduce((acc, curr) => acc + curr.operating_profit, 0);

    const profitData = cardData.profit_data || [];
    const employeeCosts = profitData.map((data) => data.employee_cost);

    const netProfits = profitData.map((data) => data.net_profit);


    const balanceData = cardData.balance_data || [];
    const totalnetBalance = balanceData.reduce((acc, curr) => acc + curr.net_block, 0);
    const capitalBalance = balanceData.reduce((acc, curr) => acc + curr.capital_work_in_progress, 0);
    const otherBalance = balanceData.reduce((acc, curr) => acc + curr.other_assets, 0);
    const totalBalance = balanceData.reduce((acc, curr) => acc + curr.total, 0);


    const cashFlowData = cardData.cashflow_data || [];

    // Assuming cashFlowData has the following structure:
    // [
    //   { month: 'January', net_cash_flow: 100, cash_from_operating_activity: 50, cash_from_investing_activity: -20, cash_from_financing_activity: 30 },
    //   { month: 'February', net_cash_flow: 200, cash_from_operating_activity: 70, cash_from_investing_activity: -30, cash_from_financing_activity: 50 },
    //   ...
    // ]

    // Extract monthly labels (assuming month is available in the data)


    // Extract cash flow data for each category
    const cashNetflows = cashFlowData.map((data) => data.net_cash_flow);
    const cashOperatingActivities = cashFlowData.map((data) => data.cash_from_operating_activity);
    const cashInvestingActivities = cashFlowData.map((data) => data.cash_from_investing_activity);
    const cashFinancingActivities = cashFlowData.map((data) => data.cash_from_financing_activity);

    // Log the values to verify correctness
    console.log(cashNetflows, cashOperatingActivities, cashInvestingActivities, cashFinancingActivities);

    // Construct bar chart data
    const barChartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Net Cash Flow',
                data: cashNetflows,
                backgroundColor: '#10b981',
                borderWidth: 1,
            },
            {
                label: 'Cash from Operating Activities',
                data: cashOperatingActivities,
                backgroundColor: '#06b6d4',
                borderWidth: 1,
            },
            {
                label: 'Cash from Investing Activities',
                data: cashInvestingActivities,
                backgroundColor: '#f43f5e',
                borderWidth: 1,
            },
            {
                label: 'Cash from Financing Activities',
                data: cashFinancingActivities,
                backgroundColor: '#e879f9',
                borderWidth: 1,
            },
        ],
    };

    // Now barChartData is structured correctly for your chart




    const PieChartData = {
        labels: ['Total Net Balance', 'Capital Work in Progress', 'Other Assets', 'Total Balance'],
        datasets: [
            {
                label: 'Balance Sheet',
                data: [totalnetBalance, capitalBalance, otherBalance, totalBalance],
                backgroundColor: [
                    '#10b981',
                    '#06b6d4',
                    '#f43f5e',
                    '#e879f9',
                ],
                borderWidth: 1,
            },
        ],
    };


    const lineChart = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
            {
                label: 'Employee Costs',
                data: employeeCosts,
                borderColor: 'rgba(75, 192, 192, 1)', // Change to your preferred color
                backgroundColor: 'rgba(75, 192, 192, 0.5)', // Change to your preferred color
            },
            {
                label: 'Net Profit',
                data: netProfits,
                borderColor: 'rgba(255, 99, 132, 1)', // Change to your preferred color
                backgroundColor: 'rgba(255, 99, 132, 0.5)', // Change to your preferred color
            }
        ]
    };


    const doughnutChartData = {
        labels: ['Total Sales', 'Total Expenses', 'Total Net Profit', 'Operating Profit'],
        datasets: [
            {
                label: 'Financial Overview',
                data: [totalSales, totalExpenses, totalNetProfit, operatingProfit],
                backgroundColor: [
                    '#10b981',
                    '#06b6d4',
                    '#f43f5e',
                    '#e879f9',
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true, // Ensures the chart takes the height/width specified
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 18, // Increase label size for the legend
                    },
                    color: "#000", // Set legend label color to black
                },
            },
    
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}`;
                    },
                },
                bodyFont: {
                    size: 14, // Increase tooltip label size
                },
            },
            datalabels: {
                // Optional: If you're using chartjs-plugin-datalabels, customize its properties
                color: '#fff',
                font: {
                    size: 16, // Increase data label size
                },
            },
        },
    
        scales: {
            x: {
                ticks: {
                    color: "#000", // Set the color of x-axis labels to black
                    font: {
                        size: 12, // Customize font size for x-axis labels
                    },
                },
                grid: {
                    color: "#e0e0e0", // Optional: Customize gridline color for x-axis
                },
            },
            y: {
                ticks: {
                    color: "#000", // Set the color of y-axis labels to black
                    font: {
                        size: 12, // Customize font size for y-axis labels
                    },
                },
                grid: {
                    color: "#e0e0e0", // Optional: Customize gridline color for y-axis
                },
            },
        },
    
        elements: {
            arc: {
                borderWidth: 2, // Optional: increase the border width of the arcs
            },
        },
        barThickness: 24, // Optional: set the bar thickness
        maxBarThickness: 50, // Limit the maximum bar thickness
    };
    

    Chart.register(CategoryScale);

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
                    <div className="flex flex-col w-full h-full p-4">
                        {/* Main stats area */}
                        <div className="h-full overflow-y-auto scroll-smooth scrollbar-none mx-4 ">
                            <div className="space-y-12 w-full flex flex-col items-center">
                                <div className='flex flex-col items-center space-y-4 mb-16'>
                                    <h1 className="text-6xl text-center font-semibold text-gray-800 dark:text-gray-50 mb-">Interactive Dashboard</h1>
                                    <h4 className="text-2xl text-center text-gray-900 dark:text-gray-200 max-w-5xl italic ">Experience a seamless blend of stunning visuals and intuitive navigation, empowering you to explore trends, track performance, and make informed decisions at your fingertips.</h4>
                                </div>
                                {/* Stats Cards */}
                                <div className="flex gap-8 justify-center">
                                    {/* Total Documents Card */}
                                    <div className="bg-gray-100 dark:bg-[#19191c] p-6 rounded-lg shadow-lg flex flex-col justify-between border-2 border-gray-300 dark:border-gray-700 w-[25rem] h-[14rem] transition-all duration-300 hover:shadow-xl transform hover:scale-105">
                                        <h1 className="text-4xl  text-gray-800 dark:text-gray-200">Total Documents</h1>
                                        <div className='flex justify-start items-center space-x-4 mt-4'>
                                            <div className="bg-[#e7dcfa] dark:bg-[#392f4f] p-4 rounded-lg flex items-center justify-center">
                                                <File className="text-3xl text-purple-700 dark:text-purple-500 " size={64} />
                                            </div>
                                            <p className="text-4xl text-gray-800 dark:text-gray-300">{cardData.total_documents}</p>
                                        </div>
                                    </div>

                                    {/* Total Collections Card */}
                                    <div className="bg-gray-100 dark:bg-[#19191c] p-6 rounded-lg shadow-lg flex flex-col justify-between border-2 border-gray-300 dark:border-gray-700 w-[25rem] h-[14rem] transition-all duration-300 hover:shadow-xl transform hover:scale-105">
                                        <h1 className="text-4xl  text-gray-800 dark:text-gray-200">Total Collections</h1>
                                        <div className='flex justify-start items-center space-x-4 mt-4'>
                                            <div className="bg-[#daf2e0] dark:bg-[#2d4536] p-4 rounded-lg flex items-center justify-center">
                                                <Boxes className=" text-green-700 dark:text-green-600 text-3xl" size={64} />
                                            </div>
                                            <p className="text-4xl text-gray-800 dark:text-gray-300">{cardData.total_collections}</p>
                                        </div>
                                    </div>

                                    {/* Decisions In Progress Card */}
                                    <div className="bg-gray-100 dark:bg-[#19191c] p-6 rounded-lg shadow-lg flex flex-col justify-between border-2 border-gray-300 dark:border-gray-700 w-[25rem] h-[14rem] transition-all duration-300 hover:shadow-xl transform hover:scale-105">
                                        <h1 className="text-4xl  text-gray-800 dark:text-gray-200">Actions In Progress</h1>
                                        <div className='flex justify-start items-center space-x-4 mt-4'>
                                            <div className="bg-[#cce6ff] dark:bg-[#1f3952] p-4 rounded-lg flex items-center justify-center">
                                                <ChartColumnIncreasing className="text-blue-500 dark:text-blue-500 text-3xl" size={64} />
                                            </div>
                                            <p className="text-4xl text-gray-800 dark:text-gray-300">{cardData.decisions_in_progress}</p>
                                        </div>
                                    </div>

                                    {/* Total Pending Decisions Card */}
                                    <div className="bg-gray-100 dark:bg-[#19191c] p-6 rounded-lg shadow-lg flex flex-col justify-between border-2 border-gray-300 dark:border-gray-700 w-[25rem] h-[14rem] transition-all duration-300 hover:shadow-xl transform hover:scale-105">
                                        <h1 className="text-4xl  text-gray-800 dark:text-gray-200">Pending Action Items</h1>
                                        <div className='flex justify-start items-center space-x-4 mt-4'>
                                            <div className="bg-[#f5dad0] dark:bg-[#472e25] p-4 rounded-lg flex items-center justify-center">
                                                <ClockArrowUp className="text-orange-700 dark:text-orange-500 text-3xl" size={64} />
                                            </div>
                                            <p className="text-4xl text-gray-800 dark:text-gray-300">{cardData.total_pending_decisions}</p>
                                        </div>
                                    </div>
                                </div>

                                <h1 className="text-4xl font-semibold text-gray-800 dark:text-gray-200 mt-12">Business Insights</h1>
                                {/* 2x2 Grid of Charts */}
                                <div className="grid grid-cols-2 gap-12 mx-auto w-[102rem] justify-center pt-1 pb-24 ">
                                    {/* Pie Chart */}
                                    <div className="bg-gray-100 dark:bg-[#19191c] p-6 rounded-lg shadow-lg border-2 w-full h-[520px] flex flex-col justify-center items-center">
                                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Balance Sheet Overview</h2>
                                        <div className="flex-gr flex justify-center items-center w-[450px]">
                                            <Pie data={PieChartData} options={chartOptions} />
                                        </div>
                                    </div>

                                    <div className="bg-gray-100 dark:bg-[#19191c] p-6 rounded-lg shadow-lg border-2 w-full h-[520px] flex flex-col justify-center items-center">
                                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Quaterly Financial Overview</h2>
                                        <div className="flex-gr flex justify-center items-center w-[450px]">
                                            <Doughnut data={doughnutChartData} options={chartOptions} />
                                        </div>
                                    </div>

                                    <div className="bg-gray-100 dark:bg-[#19191c] p-6 rounded-lg shadow-lg border-2">
                                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Cash Flow Analysis</h2>

                                        <Bar data={barChartData} options={chartOptions} />

                                    </div>

                                    <div className="bg-gray-100 dark:bg-[#19191c] p-6 rounded-lg shadow-lg border-2">
                                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Employee Costs vs Net Profit</h2>
                                        <Line data={lineChart} options={chartOptions} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
