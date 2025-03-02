import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Image } from 'react-native';
import ColorPalette from '../../constants/ColorPalette';
import UserOnlineCircle from '../../components/UserOnlineCircle';
import Post from '../../components/Post';
import { Feather } from '@expo/vector-icons';

const dummyUsers = [
    { id: '1', username: 'JohnDoe', profileImage: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: '2', username: 'JaneSmith', profileImage: 'https://randomuser.me/api/portraits/women/2.jpg' },
    { id: '3', username: 'MikeJohnson', profileImage: 'https://randomuser.me/api/portraits/men/3.jpg' },
    { id: '4', username: 'EmilyBrown', profileImage: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { id: '5', username: 'DavidWilson', profileImage: 'https://randomuser.me/api/portraits/men/5.jpg' },
    { id: '6', username: 'SarahLee', profileImage: 'https://randomuser.me/api/portraits/women/6.jpg' },
];

const dummyPosts = [
    {
        id: '1',
        user: dummyUsers[0],
        media: [
            'https://images.unsplash.com/photo-1501854140801-50d01698950b',
            'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1',
        ],
        caption: 'Beautiful day hiking in the mountains!\nWhat a view! Absolutely breathtaking.\n#nature #adventure @malick',
        likes: 124,
        comments: 8,
        shares: 5,
        timeAgo: '2 hours ago'
    },
    {
        id: '2',
        user: dummyUsers[1],
        media: [
            'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023',
        ],
        caption: 'Enjoying my coffee and the amazing view this morning ☕.\nCan\'t get enough of this peaceful scenery.\nPerfect start to the day!',
        likes: 89,
        comments: 5,
        shares: 2,
        timeAgo: '5 hours ago'
    },
    {
        id: '3',
        user: dummyUsers[2],
        media: [
            'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b',
            'https://images.unsplash.com/photo-1593642532781-03e79bf5bec2',
            'https://images.unsplash.com/photo-1592194996308-7b43878e84a6',
        ],
        caption: 'Just got this new tech gadget! What do you think?.\nIt\'s a game changer!\nSo many cool features. #tech #newgadget',
        likes: 212,
        comments: 24,
        timeAgo: '1 day ago'
    },
    {
        id: '4',
        user: dummyUsers[3],
        media: [
            'https://images.unsplash.com/photo-1551316679-9c6ae9dec224',
        ],
        caption: 'Exploring the city today!\nSo much to see and do.\nLoving the urban vibes. #citylife #explore',
        likes: 45,
        comments: 3,
        shares: 1,
        timeAgo: '2 days ago'
    },
];

// University-specific announcements
const announcements = [
    {
        id: '1',
        title: 'Campus Network Maintenance',
        description: 'WiFi services will be interrupted on June 20th from 10 PM to 2 AM for system upgrades.',
        date: 'Today',
        priority: 'high'
    },
    {
        id: '2',
        title: 'Fall Semester Registration',
        description: 'Registration for Fall 2023 courses is now open for all students. Please check your eligibility and timeslots.',
        date: 'Yesterday',
        priority: 'medium'
    }
];

// Trending topics in the university
const trendingTopics = [
    {
        id: '1',
        topic: 'Final Exams',
        posts: 342,
        trending: 'up'
    },
    {
        id: '3',
        topic: 'Faculty Awards',
        posts: 156,
        trending: 'down'
    },
    {
        id: '4',
        topic: 'Student Council',
        posts: 125,
        trending: 'up'
    }
];

// University issues
const universityIssues = [
    {
        id: '1',
        title: 'Library Hours Extension',
        department: 'Library',
        status: 'Open',
        votes: 87,
        comments: 23
    },
    {
        id: '2',
        title: 'Computer Lab Equipment',
        department: 'IT Services',
        status: 'In Progress',
        votes: 65,
        comments: 18
    },
    {
        id: '3',
        title: 'Cafeteria Menu Variety',
        department: 'Food Services',
        status: 'Open',
        votes: 43,
        comments: 31
    }
];

export default function HomeScreen() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const categories = ['All', 'Announcements', 'Trends', 'Issues', 'Posts'];
    const [selectedFilter, setSelectedFilter] = useState('Recent');
    const filters = ['Recent', 'Popular', 'Following'];

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={styles.welcomeText}>Welcome back</Text>
                    <Text style={styles.nameText}>John Doe</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Feather name="search" size={22} color={ColorPalette.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <View style={styles.notificationDot} />
                        <Feather name="bell" size={22} color={ColorPalette.white} />
                    </TouchableOpacity>
                </View>
            </View>
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryTabs}
            >
                {categories.map(category => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.categoryTab,
                            selectedCategory === category && styles.selectedCategoryTab
                        ]}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                selectedCategory === category && styles.selectedCategoryText
                            ]}
                        >
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderAnnouncements = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Announcements</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
            </View>
            
            {announcements.map(announcement => (
                <TouchableOpacity 
                    key={announcement.id} 
                    style={styles.announcementCard}
                >
                    <View style={[
                        styles.priorityIndicator,
                        announcement.priority === 'high' ? styles.highPriority : styles.mediumPriority
                    ]} />
                    <View style={styles.announcementContent}>
                        <Text style={styles.announcementTitle}>{announcement.title}</Text>
                        <Text style={styles.announcementDescription} numberOfLines={2}>
                            {announcement.description}
                        </Text>
                        <Text style={styles.announcementDate}>{announcement.date}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={ColorPalette.text_light} />
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderTrendingTopics = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Trending Topics</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>View all</Text>
                </TouchableOpacity>
            </View>
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendsScrollContent}
            >
                {trendingTopics.map(trend => (
                    <TouchableOpacity 
                        key={trend.id} 
                        style={styles.trendCard}
                    >
                        <View style={styles.trendTopRow}>
                            <Text style={styles.trendTag}># {trend.topic}</Text>
                            <Feather 
                                name={trend.trending === 'up' ? 'trending-up' : 'trending-down'} 
                                size={16} 
                                color={trend.trending === 'up' ? ColorPalette.accent : '#FF5C5C'} 
                            />
                        </View>
                        <Text style={styles.trendPostsCount}>{trend.posts} posts</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderIssues = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Issues</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
            </View>
            
            {universityIssues.map(issue => (
                <TouchableOpacity key={issue.id} style={styles.issueCard}>
                    <View style={styles.issueHeader}>
                        <View style={styles.deptBadge}>
                            <Text style={styles.deptText}>{issue.department}</Text>
                        </View>
                        <View style={[
                            styles.statusBadge,
                            issue.status === 'Open' ? styles.statusOpen : styles.statusInProgress
                        ]}>
                            <Text style={[
                                styles.statusText,
                                issue.status === 'Open' ? styles.statusOpenText : styles.statusInProgressText
                            ]}>
                                {issue.status}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.issueTitle}>{issue.title}</Text>
                    <View style={styles.issueFooter}>
                        <View style={styles.issueStats}>
                            <View style={styles.issueStat}>
                                <Feather name="thumbs-up" size={14} color={ColorPalette.text_light} />
                                <Text style={styles.issueStatText}>{issue.votes}</Text>
                            </View>
                            <View style={styles.issueStat}>
                                <Feather name="message-circle" size={14} color={ColorPalette.text_light} />
                                <Text style={styles.issueStatText}>{issue.comments}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.issueButton}>
                            <Text style={styles.issueButtonText}>Support</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderOnlineTeamMembers = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Online Users</Text>
                <TouchableOpacity>
                    <Text style={styles.seeAllText}>See all</Text>
                </TouchableOpacity>
            </View>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.onlineUsersContainer}
                contentContainerStyle={styles.onlineUsersContent}
            >
                {dummyUsers.map(user => (
                    <UserOnlineCircle key={user.id} user={user} />
                ))}
            </ScrollView>
        </View>
    );
    
    const renderPosts = () => (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Latest Posts</Text>
                <View style={styles.filtersContainer}>
                    {filters.map(filter => (
                        <TouchableOpacity 
                            key={filter}
                            style={[
                                styles.filterButton,
                                selectedFilter === filter && styles.activeFilterButton
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedFilter === filter && styles.activeFilterText
                            ]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            {dummyPosts.slice(0, 2).map(post => (
                <Post key={post.id} post={post} />
            ))}
            <TouchableOpacity style={styles.viewMoreButton}>
                <Text style={styles.viewMoreText}>View More Posts</Text>
            </TouchableOpacity>
        </View>
    );

    const renderContent = () => {
        switch (selectedCategory) {
            case 'Announcements':
                return (
                    <>
                        {renderAnnouncements()}
                    </>
                );
            case 'Trends':
                return (
                    <>
                        {renderTrendingTopics()}
                    </>
                );
            case 'Issues':
                return (
                    <>
                        {renderIssues()}
                    </>
                );
            case 'Posts':
                return (
                    <>
                        {renderOnlineTeamMembers()}
                        {renderPosts()}
                    </>
                );
            default:
                return (
                    <>
                        {renderAnnouncements()}
                        {renderTrendingTopics()}
                        {renderOnlineTeamMembers()}
                        {renderPosts()}
                    </>
                );
        }
    };

    const renderQuickActions = () => (
        <View style={styles.quickActionsContainer}>
            <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                    <Feather name="edit-3" size={20} color={ColorPalette.white} />
                </View>
                <Text style={styles.quickActionText}>New Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                    <Feather name="alert-circle" size={20} color={ColorPalette.white} />
                </View>
                <Text style={styles.quickActionText}>Report Issue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                    <Feather name="bar-chart-2" size={20} color={ColorPalette.white} />
                </View>
                <Text style={styles.quickActionText}>Trends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
                <View style={styles.quickActionIcon}>
                    <Feather name="users" size={20} color={ColorPalette.white} />
                </View>
                <Text style={styles.quickActionText}>Connect</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {renderHeader()}
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {renderQuickActions()}
                {renderContent()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: ColorPalette.main_black,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        backgroundColor: ColorPalette.main_black_2,
        paddingTop: 50,
        paddingBottom: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 15,
    },
    welcomeText: {
        color: ColorPalette.text_light,
        fontSize: 14,
        fontFamily: 'CG-Regular',
    },
    nameText: {
        color: ColorPalette.white,
        fontSize: 20,
        fontFamily: 'CG-Bold',
    },
    headerActions: {
        flexDirection: 'row',
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: ColorPalette.main_black,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: ColorPalette.accent,
        zIndex: 1,
    },
    categoryTabs: {
        paddingHorizontal: 15,
        flexDirection: 'row',
    },
    categoryTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: ColorPalette.main_black,
    },
    selectedCategoryTab: {
        backgroundColor: 'rgba(0, 229, 190, 0.15)', // accent color with opacity
    },
    categoryText: {
        color: ColorPalette.text_light,
        fontFamily: 'CG-Medium',
        fontSize: 14,
    },
    selectedCategoryText: {
        color: ColorPalette.accent,
        fontFamily: 'CG-Medium',
    },
    
    // Quick actions
    quickActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: ColorPalette.main_black,
    },
    quickActionButton: {
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: ColorPalette.main_black_2,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    quickActionText: {
        color: ColorPalette.text_light,
        fontSize: 12,
        fontFamily: 'CG-Regular',
    },
    
    // Sections styling
    section: {
        marginBottom: 20,
        paddingHorizontal: 15,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        color: ColorPalette.white,
        fontFamily: 'CG-Bold',
    },
    seeAllText: {
        color: ColorPalette.accent,
        fontSize: 14,
        fontFamily: 'CG-Regular',
    },
    
    // Announcements
    announcementCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ColorPalette.main_black_2,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    priorityIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
        marginRight: 10,
    },
    highPriority: {
        backgroundColor: '#FF5C5C', // Red for high priority
    },
    mediumPriority: {
        backgroundColor: ColorPalette.accent, // Accent color for medium priority
    },
    announcementContent: {
        flex: 1,
    },
    announcementTitle: {
        color: ColorPalette.white,
        fontSize: 16,
        fontFamily: 'CG-Medium',
        marginBottom: 4,
    },
    announcementDescription: {
        color: ColorPalette.text_light,
        fontSize: 14,
        fontFamily: 'CG-Regular',
        marginBottom: 4,
    },
    announcementDate: {
        color: ColorPalette.text_light,
        fontSize: 12,
        fontFamily: 'CG-Regular',
    },
    
    // Trending topics
    trendsScrollContent: {
        paddingRight: 10,
    },
    trendCard: {
        backgroundColor: ColorPalette.main_black_2,
        borderRadius: 10,
        padding: 12,
        marginRight: 10,
        width: 170,
    },
    trendTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    trendTag: {
        color: ColorPalette.accent,
        fontFamily: 'CG-Medium',
        fontSize: 14,
    },
    trendPostsCount: {
        color: ColorPalette.text_light,
        fontSize: 12,
        fontFamily: 'CG-Regular',
    },
    
    // Issues
    issueCard: {
        backgroundColor: ColorPalette.main_black_2,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
    },
    issueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    deptBadge: {
        backgroundColor: 'rgba(0, 229, 190, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    deptText: {
        color: ColorPalette.accent,
        fontSize: 12,
        fontFamily: 'CG-Regular',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusOpen: {
        backgroundColor: 'rgba(255, 92, 92, 0.15)',
    },
    statusInProgress: {
        backgroundColor: 'rgba(255, 194, 26, 0.15)',
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'CG-Regular',
    },
    statusOpenText: {
        color: '#FF5C5C',
    },
    statusInProgressText: {
        color: '#FFC21A',
    },
    issueTitle: {
        color: ColorPalette.white,
        fontSize: 16,
        fontFamily: 'CG-Medium',
        marginBottom: 12,
    },
    issueFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    issueStats: {
        flexDirection: 'row',
    },
    issueStat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    issueStatText: {
        color: ColorPalette.text_light,
        fontSize: 12,
        fontFamily: 'CG-Regular',
        marginLeft: 4,
    },
    issueButton: {
        backgroundColor: 'rgba(0, 229, 190, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    issueButtonText: {
        color: ColorPalette.accent,
        fontSize: 12,
        fontFamily: 'CG-Medium',
    },
    
    // Online users
    onlineUsersContainer: {
        marginLeft: -15, // Offset the padding to align with section
    },
    onlineUsersContent: {
        paddingLeft: 15,
        paddingRight: 5,
    },
    
    // Posts filters
    filtersContainer: {
        flexDirection: 'row',
    },
    filterButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginLeft: 5,
        borderRadius: 15,
    },
    activeFilterButton: {
        backgroundColor: ColorPalette.main_black_2,
    },
    filterText: {
        color: ColorPalette.text_light,
        fontSize: 12,
        fontFamily: 'CG-Regular',
    },
    activeFilterText: {
        color: ColorPalette.accent,
    },
    
    viewMoreButton: {
        backgroundColor: ColorPalette.main_black_2,
        borderRadius: 10,
        padding: 12,
        alignItems: 'center',
        marginVertical: 10,
    },
    viewMoreText: {
        color: ColorPalette.accent,
        fontFamily: 'CG-Medium',
        fontSize: 14,
    },
});