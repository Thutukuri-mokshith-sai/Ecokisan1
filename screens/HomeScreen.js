import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
    const [isProfileToggled, setIsProfileToggled] = useState(false);

    const logout = async () => {
        setIsProfileToggled(false);
        await AsyncStorage.removeItem('token');
        navigation.replace('Login');
    };

    const sections = [
        {
            title: 'AI & Data',
            items: [
                { name: 'Real-time Soil Estimation', icon: 'thermometer', screen: 'SoilDashboard' },
                { name: 'Weather Forecast', icon: 'weather-partly-cloudy', screen: 'WeatherDashboard' },
                { name: 'Crop Rotation Tracker', icon: 'leaf-sync', screen: 'CropRotationTracker' },
                { name: 'Crop Recommendations', icon: 'sprout', screen: 'CropRecommendations' },
                { name: 'Yield & Profit Forecast', icon: 'chart-bar', screen: 'YieldProfitForecast' },
            ],
        },
        {
            title: 'Mobile App Features',
            items: [
                { name: 'Multilingual Support', icon: 'web', screen: 'MultilingualSupport' },
                { name: 'Offline Mode', icon: 'signal-off', screen: 'OfflineMode' },
                { name: 'Input Farm Data', icon: 'file-edit', screen: 'InputFarmData' },
                { name: 'Text & Image Recommendations', icon: 'message-image', screen: 'Recommendations' },
                { name: 'Voice & Chat Queries', icon: 'microphone-message', screen: 'VoiceChat' },
                { name: 'Dashboard Analytics', icon: 'view-dashboard', screen: 'Dashboard' },
            ],
        },
        {
            title: 'ML/AI Capabilities',
            items: [
                { name: 'Crop Selection Model', icon: 'barley', screen: 'CropSelectionModel' },
                { name: 'Predictive Analytics', icon: 'chart-line-variant', screen: 'PredictiveAnalytics' },
                { name: 'Disease Detection', icon: 'flower', screen: 'DiseaseDetection' },
                { name: 'Pest Diagnosis', icon: 'bug', screen: 'PestDiagnosis' },
                { name: 'Actionable Advice', icon: 'lightbulb', screen: 'ActionableAdvice' },
            ],
        },
    ];

    const handleCardPress = (item) => {
        console.log(`Card pressed: ${item.name}`);
        if (item.screen && navigation) {
            navigation.navigate(item.screen);
        } else {
            console.log(`Screen for ${item.name} is not defined.`);
        }
    };

    const toggleProfile = () => {
        setIsProfileToggled(!isProfileToggled);
    };

    const handleNavPress = (navName) => {
        setIsProfileToggled(false); // Close dropdown if any nav item is clicked
        switch (navName) {
            case 'Home':
                break;
            case 'Market':
                navigation.navigate('Market');
                break;
            case 'Analytics':
                navigation.navigate('Analytics');
                break;
            case 'Profile':
                navigation.navigate('Profile');
                break;
            default:
                break;
        }
    };

    // Color definitions
    const primaryGradient = ['#80ac45', '#498c39']; // light green to medium green
    const secondaryGradient = ['#498c39', '#2e6b21']; // medium green to dark green
    const textOffWhite = '#f0f0f0';
    const textWhite = '#fff';
    const interactiveBg = 'rgba(255, 255, 255, 0.2)';
    const disabledBg = 'rgba(255, 255, 255, 0.1)';
    const sectionHeaderBg = 'rgba(255, 255, 255, 0.3)'; // For table headers, if any
    const bottomBorderHeader = 'rgba(255, 255, 255, 0.5)'; // For table header borders, if any

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <LinearGradient
                    colors={secondaryGradient} // Use dark green gradient for header
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <Text style={styles.appName}>FarmX</Text>
                    <TouchableOpacity onPress={toggleProfile} style={styles.userProfile}>
                        <MaterialCommunityIcons name="account-circle" size={32} color={textWhite} />
                    </TouchableOpacity>
                </LinearGradient>

                <ScrollView contentContainerStyle={styles.mainContent}>
                    {sections.map((section, sectionIndex) => (
                        <View key={sectionIndex} style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: textOffWhite }]}>{section.title}</Text>
                            <View style={styles.gridContainer}>
                                {section.items.map((item, itemIndex) => (
                                    <TouchableOpacity
                                        key={itemIndex}
                                        style={[styles.card, { backgroundColor: sectionHeaderBg }]} // Use section header bg for cards
                                        onPress={() => handleCardPress(item)}
                                    >
                                        <MaterialCommunityIcons name={item.icon} size={36} color={primaryGradient[0]} style={styles.cardIcon} />
                                        <Text style={[styles.cardName, { color: textWhite }]}>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>

                <View style={[styles.bottomNav, { backgroundColor: sectionHeaderBg }]}>
                    <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={() => handleNavPress('Home')}>
                        <MaterialCommunityIcons name="home" size={24} color={primaryGradient[0]} />
                        <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => handleNavPress('Analytics')}>
                        <MaterialCommunityIcons name="chart-bar" size={24} color={textOffWhite} />
                        <Text style={[styles.navText, { color: textOffWhite }]}>Analytics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => handleNavPress('Market')}>
                        <MaterialCommunityIcons name="storefront" size={24} color={textOffWhite} />
                        <Text style={[styles.navText, { color: textOffWhite }]}>Market</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => handleNavPress('Profile')}>
                        <MaterialCommunityIcons name="account" size={24} color={isProfileToggled ? primaryGradient[0] : textOffWhite} />
                        <Text style={[styles.navText, isProfileToggled && styles.activeNavText]}>Profile</Text>
                    </TouchableOpacity>
                </View>

                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={isProfileToggled}
                    onRequestClose={() => setIsProfileToggled(false)}
                >
                    <TouchableOpacity style={styles.modalOverlay} onPress={() => setIsProfileToggled(false)}>
                        <View style={[styles.dropdownMenu, { backgroundColor: sectionHeaderBg }]}>
                            <TouchableOpacity style={styles.dropdownItem} onPress={logout}>
                                <Text style={[styles.dropdownText, { color: textWhite }]}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#2e6b21', // Darkest green as the overall background
    },
    container: {
        flex: 1,
        backgroundColor: '#2e6b21', // Darkest green background for content
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f0f0f0', // Off-white for app name
    },
    userProfile: {
        padding: 8,
    },
    mainContent: {
        padding: 16,
        paddingBottom: 90,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#f0f0f0', // Off-white for section titles
        marginBottom: 16,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '31%', // Adjusted width for three columns
        aspectRatio: 1,
        borderRadius: 16,
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    cardIcon: {
        marginBottom: 8,
        color:'#074823ff'
    },
    cardName: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        color: '#fff', // White for card names
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)', // Lighter border for nav
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: 'center',
        flex: 1,
    },
    activeNavItem: {
        // Active styles are applied inline based on state
    },
    navText: {
        fontSize: 10,
        color: '#f0f0f0', // Off-white for nav text
        marginTop: 4,
    },
    activeNavText: {
        color: '#80ac45', // Light green for active nav text
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Subtle dark overlay
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
        paddingTop: 85,
        paddingRight: 10,
    },
    dropdownMenu: {
        borderRadius: 8,
        paddingVertical: 8,
        width: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    dropdownItem: {
        padding: 12,
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
});