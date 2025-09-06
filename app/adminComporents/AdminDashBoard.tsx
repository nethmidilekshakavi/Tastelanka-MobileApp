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
    X,
    TrendingUp,
    Clock,
    Star,
    Eye
} from 'lucide-react';
import UsersList from "@/components/UsersList";
import CategorysScreen from "@/app/Category";
import {CategoryList, CategoryManagement, CategoryManagemt} from "@/components/CategoryList";

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
        <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
                <p className="text-green-100">Here's what's happening with your recipe platform today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Users className="text-blue-600" size={24} />
                        </div>
                        <div className="text-green-500 text-sm font-medium flex items-center">
                            <TrendingUp size={16} className="mr-1" />
                            +12%
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">1,234</div>
                    <div className="text-gray-600 text-sm">Total Users</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Grid3X3 className="text-purple-600" size={24} />
                        </div>
                        <div className="text-green-500 text-sm font-medium flex items-center">
                            <TrendingUp size={16} className="mr-1" />
                            +5%
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">56</div>
                    <div className="text-gray-600 text-sm">Categories</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-xl">
                            <ChefHat className="text-orange-600" size={24} />
                        </div>
                        <div className="text-green-500 text-sm font-medium flex items-center">
                            <TrendingUp size={16} className="mr-1" />
                            +18%
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">2,890</div>
                    <div className="text-gray-600 text-sm">Total Recipes</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                            <Plus className="text-green-600" size={24} />
                        </div>
                        <div className="text-green-500 text-sm font-medium flex items-center">
                            <TrendingUp size={16} className="mr-1" />
                            +25%
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-800 mb-1">145</div>
                    <div className="text-gray-600 text-sm">New Today</div>
                </div>
            </div>

            {/* Charts and Activities Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Recent Activities</h2>
                        <Clock className="text-gray-400" size={20} />
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <ChefHat className="text-blue-600" size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-800">New recipe "Chicken Curry" added</div>
                                <div className="text-xs text-gray-500 mt-1">by John • 2 hours ago</div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-4 bg-purple-50 rounded-xl">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Grid3X3 className="text-purple-600" size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-800">Category "Desserts" updated</div>
                                <div className="text-xs text-gray-500 mt-1">4 hours ago</div>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Users className="text-green-600" size={16} />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-800">New user registration: Sarah</div>
                                <div className="text-xs text-gray-500 mt-1">6 hours ago</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Recipes */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Top Recipes</h2>
                        <Star className="text-gray-400" size={20} />
                    </div>
                    <div className="space-y-4">
                        {['Chicken Biriyani', 'Chocolate Cake', 'Fish Curry', 'Kottu Roti'].map((recipe, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">{recipe}</div>
                                        <div className="text-xs text-gray-500 flex items-center">
                                            <Eye size={12} className="mr-1" />
                                            {(Math.random() * 1000 + 500).toFixed(0)} views
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center text-yellow-500">
                                    <Star size={16} fill="currentColor" />
                                    <span className="text-sm text-gray-600 ml-1">
                                        {(Math.random() * 2 + 3).toFixed(1)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUserManagement = () => (
        <div className="p-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6">
                <h1 className="text-2xl font-bold mb-2">User Management</h1>
                <p className="text-blue-100">Manage and monitor all users on your platform</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ">
                <div className="text-center py-4">
                    <UsersList />

                </div>
            </div>
        </div>
    );

    const renderCategoryManagement = () => (
        <div className="p-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6">
                <h1 className="text-2xl font-bold mb-2">Category Management</h1>
                <p className="text-blue-100">Manage and monitor all users on your platform</p>
            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ">
                <div className="text-center py-4">
                    <CategoryManagement />

                </div>
            </div>
        </div>
    );

    const renderRecipeManagement = () => (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-6 text-white flex-1 mr-0 sm:mr-4">
                    <h1 className="text-2xl font-bold mb-2">Recipe Management</h1>
                    <p className="text-orange-100">Create and manage delicious recipes</p>
                </div>
                <button className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <Plus size={20} />
                    Add Recipe
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <Search size={20} className="text-green-600" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search recipes..."
                        className="flex-1 outline-none text-gray-700 bg-transparent"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {['Chicken Curry', 'Chocolate Cake', 'Caesar Salad', 'Tomato Soup', 'Grilled Fish'].map((recipe, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-4 flex-1">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    ['bg-red-100', 'bg-yellow-100', 'bg-green-100', 'bg-blue-100', 'bg-purple-100'][index]
                                }`}>
                                    <ChefHat className={`${
                                        ['text-red-600', 'text-yellow-600', 'text-green-600', 'text-blue-600', 'text-purple-600'][index]
                                    }`} size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{recipe}</h3>
                                    <p className="text-gray-600 text-sm mb-1">
                                        Category: {['Main Course', 'Dessert', 'Salad', 'Soup', 'Main Course'][index]}
                                    </p>
                                    <p className="text-gray-600 text-sm">Added by: Chef {index + 1}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                                    View
                                </button>
                                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                                    Edit
                                </button>
                                <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors">
                                    Delete
                                </button>
                            </div>
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
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white h-16 flex items-center px-6 shadow-xl">
                <button
                    onClick={() => setSidebarVisible(!sidebarVisible)}
                    className="mr-4 p-2 hover:bg-green-800 rounded-xl transition-colors"
                >
                    {sidebarVisible ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h1 className="text-xl font-bold flex-1">Recipe Admin Dashboard</h1>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-green-800 rounded-xl transition-colors relative">
                        <Bell size={20} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    </button>
                    <button className="p-2 hover:bg-green-800 rounded-xl transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                {sidebarVisible && (
                    <div className="w-64 bg-white shadow-xl min-h-screen">
                        {/* Profile Section */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-green-50 to-green-100">
                            <div className="text-center">
                                {/* Profile Picture */}
                                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                                    <ChefHat size={24} className="text-white" />
                                </div>
                                <h2 className="font-bold text-gray-800 text-lg">Admin Chef</h2>
                                <p className="text-sm text-gray-600">Super Administrator</p>
                                <div className="flex justify-center mt-2">
                                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                                        Online
                                    </div>
                                </div>
                            </div>
                        </div>

                        <nav className="p-4">
                            {sidebarItems.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300 ${
                                            activeTab === item.id
                                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105'
                                                : 'text-gray-700 hover:bg-green-50 hover:text-green-600 hover:transform hover:scale-105'
                                        }`}
                                    >
                                        <IconComponent size={20} />
                                        <span className="font-medium">{item.title}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Quick Stats in Sidebar */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-600 mb-3">Quick Stats</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Today's Views</span>
                                    <span className="font-semibold text-green-600">2.4K</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Active Users</span>
                                    <span className="font-semibold text-blue-600">156</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">New Recipes</span>
                                    <span className="font-semibold text-purple-600">12</span>
                                </div>
                            </div>
                        </div>
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