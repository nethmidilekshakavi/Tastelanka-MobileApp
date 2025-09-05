import React, { useState } from 'react';
import {
    Home,
    Users,
    Grid3X3,
    ChefHat,
    Plus,
    Search,
    Bell,
    Settings,
    Menu,
    X
} from 'lucide-react';
import {Text, TouchableOpacity, View} from "react-native";
import {router} from "expo-router";
import UsersList from '@/components/UsersList';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarVisible, setSidebarVisible] = useState(true);

    const sidebarItems = [
        { id: 'dashboard', title: 'Dashboard', icon: Home },
        { id: 'users', title: 'User Management', icon: Users },
        { id: 'categories', title: 'Category Management', icon: Grid3X3 },
        { id: 'recipes', title: 'Recipe Management', icon: ChefHat },
    ];

    const renderDashboard = () => (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">1,234</div>
                    <div className="text-gray-600">Total Users</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">56</div>
                    <div className="text-gray-600">Categories</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">2,890</div>
                    <div className="text-gray-600">Recipes</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">145</div>
                    <div className="text-gray-600">New Today</div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
                <div className="space-y-4">
                    <div className="border-b border-gray-100 pb-3">
                        <div className="text-sm text-gray-700">New recipe "Chicken Curry" added by John</div>
                        <div className="text-xs text-gray-500 mt-1">2 hours ago</div>
                    </div>
                    <div className="border-b border-gray-100 pb-3">
                        <div className="text-sm text-gray-700">Category "Desserts" updated</div>
                        <div className="text-xs text-gray-500 mt-1">4 hours ago</div>
                    </div>
                    <div className="pb-3">
                        <div className="text-sm text-gray-700">New user registration: Sarah</div>
                        <div className="text-xs text-gray-500 mt-1">6 hours ago</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUserManagement = () => (
        <UsersList />
    );

    const renderCategoryManagement = () => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['Main Courses', 'Appetizers', 'Desserts', 'Beverages', 'Salads', 'Soups'].map((category, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{category}</h3>
                        <p className="text-gray-600 mb-4">{Math.floor(Math.random() * 50) + 10} recipes</p>
                        <div className="flex gap-2">
                            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                                Edit
                            </button>
                            <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderRecipeManagement = () => (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Recipe Management</h1>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors">
                    <Plus size={20} />
                    Add Recipe
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center gap-3">
                <Search size={20} className="text-green-600" />
                <input
                    type="text"
                    placeholder="Search recipes..."
                    className="flex-1 outline-none text-gray-700"
                />
            </div>

            <div className="space-y-4">
                {['Chicken Curry', 'Chocolate Cake', 'Caesar Salad', 'Tomato Soup', 'Grilled Fish'].map((recipe, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{recipe}</h3>
                            <p className="text-gray-600 text-sm mb-1">
                                Category: {['Main Course', 'Dessert', 'Salad', 'Soup', 'Main Course'][index]}
                            </p>
                            <p className="text-gray-600 text-sm">Added by: Chef {index + 1}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors">
                                View
                            </button>
                            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">
                                Edit
                            </button>
                            <button className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return renderDashboard();
            case 'users':
                return renderUserManagement();
            case 'categories':
                return renderCategoryManagement();
            case 'recipes':
                return renderRecipeManagement();
            default:
                return renderDashboard();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-green-600 text-white h-16 flex items-center px-6 shadow-lg">
                <button
                    onClick={() => setSidebarVisible(!sidebarVisible)}
                    className="mr-4 p-2 hover:bg-green-700 rounded-lg transition-colors"
                >
                    {sidebarVisible ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h1 className="text-xl font-bold flex-1">Recipe Admin Dashboard</h1>
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-green-700 rounded-lg transition-colors">
                        <Bell size={20} />
                    </button>
                    <button className="p-2 hover:bg-green-700 rounded-lg transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                {sidebarVisible && (
                    <div className="w-64 bg-white shadow-lg min-h-screen">
                        <div className="p-6 border-b border-gray-200 text-center">
                            <ChefHat size={32} className="text-green-600 mx-auto mb-2" />
                            <h2 className="font-bold text-gray-800">Recipe Admin</h2>
                        </div>

                        <nav className="p-4">
                            {sidebarItems.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                                            activeTab === item.id
                                                ? 'bg-green-600 text-white'
                                                : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                                        }`}
                                    >
                                        <IconComponent size={20} />
                                        <span className="font-medium">{item.title}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;