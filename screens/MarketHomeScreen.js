import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Define color constants
const COLORS = {
  primaryGreen: '#80ac45',
  darkGreen: '#498c39',
  lightGreen: '#2e6b21',
  white: '#f0f0f0',
  semiTransparentWhite: 'rgba(255, 255, 255, 0.2)',
  lightBorder: 'rgba(255, 255, 255, 0.1)',
};

export default function MarketHomeScreen({ navigation }) {
    const marketSections = [
        {
            title: 'Market Prices',
            items: [
                { name: 'Crop Prices', icon: 'currency-usd' },
                { name: 'Fertilizer Prices', icon: 'basket-fill' }, // Ensure this icon name is correct
                { name: 'Seed Prices', icon: 'seed' },
                { name: 'Equipment Prices', icon: 'tractor' },
            ],
        },
        {
            title: 'Insights & Analysis',
            items: [
                { name: 'Demand & Supply', icon: 'chart-pie' },
                { name: 'Market Trends', icon: 'chart-line' },
                { name: 'Competitor Analysis', icon: 'account-group' },
                { name: 'Government Policies', icon: 'gavel' },
            ],
        },
        {
            title: 'Marketplace',
            items: [
                { name: 'Buy/Sell Crops', icon: 'shopping' },
                { name: 'Farming Services', icon: 'handshake' },
            ],
        },
    ];

    const handleCardPress = (cardName) => {
        console.log(`Market card pressed: ${cardName}`);
        // Add navigation logic here for specific market features
        switch (cardName) {
            case 'Crop Prices':
                // Navigate to the 'CropPrices' screen (assuming this is the name in your navigator)
                navigation.navigate('CropPrices');
                break;
            case 'Fertilizer Prices':
                // navigate to fertilizer prices screen
                break;
            // Add other cases
            default:
                break;
        }
    };

    const handleNavPress = (navName) => {
        // This function handles the navigation for the bottom tab bar.
        switch (navName) {
            case 'Home':
                navigation.navigate('Home');
                break;
            case 'Analytics':
                // navigation.navigate('Analytics'); // Uncomment and provide a screen name
                console.log('Navigate to Analytics');
                break;
            case 'Market':
                // The user is already on the Market screen, so no action is needed.
                break;
            case 'Profile':
                // navigation.navigate('Profile'); // Uncomment and provide a screen name
                console.log('Navigate to Profile');
                break;
            default:
                break;
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <LinearGradient
                    colors={[COLORS.primaryGreen, COLORS.darkGreen]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Market</Text>
                    <View style={{ width: 24 }} />
                </LinearGradient>

                <ScrollView contentContainerStyle={styles.mainContent}>
                    {marketSections.map((section, sectionIndex) => (
                        <View key={sectionIndex} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <View style={styles.gridContainer}>
                                {section.items.map((item, itemIndex) => (
                                    <TouchableOpacity
                                        key={itemIndex}
                                        style={styles.card}
                                        onPress={() => handleCardPress(item.name)}
                                    >
                                        <MaterialCommunityIcons name={item.icon} size={36} color={COLORS.darkGreen} style={styles.cardIcon} />
                                        <Text style={styles.cardName}>{item.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={() => handleNavPress('Home')}>
                        <MaterialCommunityIcons name="home" size={24} color={COLORS.white} />
                        <Text style={styles.navText}>Home</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => handleNavPress('Analytics')}>
                        <MaterialCommunityIcons name="chart-bar" size={24} color={COLORS.white} />
                        <Text style={styles.navText}>Analytics</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={() => handleNavPress('Market')}>
                        <MaterialCommunityIcons name="storefront" size={24} color={COLORS.primaryGreen} />
                        <Text style={[styles.navText, styles.activeNavText]}>Market</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => handleNavPress('Profile')}>
                        <MaterialCommunityIcons name="account" size={24} color={COLORS.white} />
                        <Text style={styles.navText}>Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#2e6b21', // Dark green background for the entire screen
    },
    container: {
        flex: 1,
        backgroundColor: '#2e6b21',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 40, // Adjusted for status bar
        // Primary Gradient Colors
        // Using the provided colors for the gradient header
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f0f0f0', // Off-white for header text
    },
    backButton: {
        padding: 8,
    },
    mainContent: {
        padding: 16,
        paddingBottom: 90, // Space for the bottom navigation
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
        width: '48%', // To create a 2-column layout
        aspectRatio: 1, // Maintain a square aspect ratio
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white for frosted effect
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
        color:'#074823ff',// Icon color will be set dynamically or based on context
    },
    cardName: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
        color: '#fff', // White for card names for readability
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // More transparent white for bottom nav background
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)', // Using the same as background for subtle separation
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        alignItems: 'center',
        flex: 1,
    },
    navText: {
        fontSize: 10,
        color: '#f0f0f0', // Off-white for navigation text
        marginTop: 4,
    },
    activeNavItem: {
        // Styles for the active navigation item
    },
    activeNavText: {
        color: '#80ac45', // Light green for active navigation text
        fontWeight: 'bold',
    },
    // Styles for specific interactive elements if needed (e.g., buttons with specific backgrounds)
    // Example for a "Fetch Prices" button or price table data:
    fetchPricesButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
        padding: 12,
        borderRadius: 25,
        marginHorizontal: 10,
        marginVertical: 5,
    },
    priceTableContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // More transparent white for table rows
        borderRadius: 8,
        marginBottom: 10,
    },
    priceTableHeader: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Slightly darker semi-transparent white for header
        borderBottomWidth: 2, // Increased border width for visual emphasis
        borderBottomColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white with more opacity
        padding: 10,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    priceTableHeaderText: {
        color: '#fff', // White for header text
        fontWeight: 'bold',
        fontSize: 16,
    },
    priceTableDataRow: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // More transparent white for data rows
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.15)', // Slightly more opaque border for separation
    },
    priceTableDataText: {
        color: '#fff', // White for data text
        fontSize: 14,
    },
    // Style for disabled button state
    disabledButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // More transparent white for disabled
    },
});