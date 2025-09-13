import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StyleSheet,
    Modal,
    Dimensions,
} from 'react-native';
import UsersList from "@/components/UsersList";
import { CategoryManagement } from "@/components/CategoryList";

const { width } = Dimensions.get('window');

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarVisible, setSidebarVisible] = useState(false);

    const sidebarItems = [
        { id: 'dashboard', title: 'Dashboard', icon: '🏠' },
        { id: 'users', title: 'Users', icon: '👥' },
        { id: 'categories', title: 'Categories', icon: '📂' },
        { id: 'recipes', title: 'Recipes', icon: '🍳' },
    ];

    const renderDashboard = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Welcome Header */}
            <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Dashboard</Text>
                <Text style={styles.welcomeSubtitle}>An overview of your application.</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Users</Text>
                        <Text style={styles.statValue}>120</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Categories</Text>
                        <Text style={styles.statValue}>15</Text>
                    </View>
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total Recipes</Text>
                        <Text style={styles.statValue}>300</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Active Today</Text>
                        <Text style={styles.statValue}>45</Text>
                    </View>
                </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.activityCard}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>

                {/* Activity Table Header */}
                <View style={styles.activityHeader}>
                    <Text style={[styles.activityHeaderText, { flex: 1.2 }]}>USER</Text>
                    <Text style={[styles.activityHeaderText, { flex: 1.5 }]}>ACTION</Text>
                    <Text style={[styles.activityHeaderText, { flex: 1 }]}>TIMESTAMP</Text>
                </View>

                {/* Activity Rows */}
                <View style={styles.activityRow}>
                    <Text style={[styles.activityCell, { flex: 1.2 }]} numberOfLines={1}>Sophia Clark</Text>
                    <Text style={[styles.activityCellAction, { flex: 1.5 }]} numberOfLines={1}>Created new recipe: Summer Salad</Text>
                    <Text style={[styles.activityCellTime, { flex: 1 }]} numberOfLines={1}>10:30 AM</Text>
                </View>

                <View style={styles.activityRow}>
                    <Text style={[styles.activityCell, { flex: 1.2 }]} numberOfLines={1}>Ethan Bennett</Text>
                    <Text style={[styles.activityCellAction, { flex: 1.5 }]} numberOfLines={1}>Updated category: Desserts</Text>
                    <Text style={[styles.activityCellTime, { flex: 1 }]} numberOfLines={1}>04:15 PM</Text>
                </View>

                <View style={styles.activityRow}>
                    <Text style={[styles.activityCell, { flex: 1.2 }]} numberOfLines={1}>Olivia Carter</Text>
                    <Text style={[styles.activityCellAction, { flex: 1.5 }]} numberOfLines={1}>Added new user: Liam Harper</Text>
                    <Text style={[styles.activityCellTime, { flex: 1 }]} numberOfLines={1}>09:00 AM</Text>
                </View>

                <View style={styles.activityRow}>
                    <Text style={[styles.activityCell, { flex: 1.2 }]} numberOfLines={1}>Noah Foster</Text>
                    <Text style={[styles.activityCellAction, { flex: 1.5 }]} numberOfLines={1}>Deleted recipe: Spicy Curry</Text>
                    <Text style={[styles.activityCellTime, { flex: 1 }]} numberOfLines={1}>02:45 PM</Text>
                </View>

                <View style={[styles.activityRow, { borderBottomWidth: 0 }]}>
                    <Text style={[styles.activityCell, { flex: 1.2 }]} numberOfLines={1}>Ava Mitchell</Text>
                    <Text style={[styles.activityCellAction, { flex: 1.5 }]} numberOfLines={1}>Modified category: Appetizers</Text>
                    <Text style={[styles.activityCellTime, { flex: 1 }]} numberOfLines={1}>11:20 AM</Text>
                </View>
            </View>
        </ScrollView>
    );

    const renderUserManagement = () => (
        <View style={styles.content}>
            <UsersList />
        </View>
    );

    const renderCategoryManagement = () => (
        <View style={styles.content}>
            <CategoryManagement />
        </View>
    );

    const renderRecipeManagement = () => (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.welcomeCard}>
                <Text style={styles.welcomeTitle}>Recipe Management</Text>
                <Text style={styles.welcomeSubtitle}>Create and manage delicious recipes</Text>
            </View>

            <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🍳</Text>
                <Text style={styles.emptyTitle}>Recipe Management</Text>
                <Text style={styles.emptySubtitle}>Recipe management features will be added soon</Text>
            </View>
        </ScrollView>
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
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setSidebarVisible(!sidebarVisible)}
                >
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recipe Admin</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Text style={styles.headerButtonText}>🔔</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.mainContainer}>
                {/* Sidebar Modal */}
                <Modal
                    visible={sidebarVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setSidebarVisible(false)}
                >
                    <View style={styles.sidebarOverlay}>
                        <View style={styles.sidebar}>
                            {/* Profile Section */}
                            <View style={styles.profileSection}>
                                <View style={styles.profileAvatar}>
                                    <Text style={styles.profileAvatarText}>AC</Text>
                                </View>
                                <Text style={styles.profileName}>Admin Chef</Text>
                                <Text style={styles.profileRole}>Super Administrator</Text>
                                <View style={styles.onlineBadge}>
                                    <Text style={styles.onlineBadgeText}>Online</Text>
                                </View>
                            </View>

                            {/* Navigation */}
                            <View style={styles.navigation}>
                                {sidebarItems.map((item) => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.navItem,
                                            activeTab === item.id && styles.navItemActive
                                        ]}
                                        onPress={() => {
                                            setActiveTab(item.id);
                                            setSidebarVisible(false);
                                        }}
                                    >
                                        <Text style={styles.navIcon}>{item.icon}</Text>
                                        <Text style={[
                                            styles.navText,
                                            activeTab === item.id && styles.navTextActive
                                        ]}>
                                            {item.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Exit Button */}
                            <View style={styles.exitSection}>
                                <TouchableOpacity style={styles.exitButton}>
                                    <Text style={styles.exitIcon}>🚪</Text>
                                    <Text style={styles.exitText}>Exit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Overlay to close sidebar */}
                        <TouchableOpacity
                            style={styles.sidebarBackground}
                            onPress={() => setSidebarVisible(false)}
                        />
                    </View>
                </Modal>

                {/* Main Content */}
                <View style={styles.contentContainer}>
                    {renderContent()}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    // Header
    header: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    menuButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },
    menuIcon: {
        fontSize: 18,
        color: '#64748B',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        flex: 1,
        marginLeft: 16,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    headerButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F1F5F9',
    },
    headerButtonText: {
        fontSize: 16,
    },

    // Main Container
    mainContainer: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
    },

    // Content
    content: {
        flex: 1,
        padding: 20,
    },

    // Welcome Card
    welcomeCard: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 12,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    welcomeSubtitle: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '400',
    },

    // Stats
    statsContainer: {
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    statLabel: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1E293B',
    },

    // Activity Card
    activityCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        padding: 20,
        paddingBottom: 16,
    },

    // Activity Table
    activityHeader: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    activityHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    activityRow: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        alignItems: 'flex-start',
    },
    activityCell: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '600',
        marginRight: 12,
    },
    activityCellAction: {
        fontSize: 14,
        color: '#64748B',
        marginRight: 12,
        lineHeight: 20,
    },
    activityCellTime: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'right',
    },

    // Sidebar
    sidebarOverlay: {
        flex: 1,
        flexDirection: 'row',
    },
    sidebar: {
        width: 280,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    sidebarBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    // Profile Section
    profileSection: {
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
    },
    profileAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    profileAvatarText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    profileName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    profileRole: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
    },
    onlineBadge: {
        backgroundColor: '#10B981',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    onlineBadgeText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Navigation
    navigation: {
        padding: 20,
        flex: 1,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 8,
    },
    navItemActive: {
        backgroundColor: '#3B82F6',
    },
    navIcon: {
        fontSize: 18,
        marginRight: 12,
        width: 24,
        textAlign: 'center',
    },
    navText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748B',
    },
    navTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Exit Section
    exitSection: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    exitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#FEF2F2',
    },
    exitIcon: {
        fontSize: 18,
        marginRight: 12,
    },
    exitText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#DC2626',
    },

    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
});

export default AdminDashboard;