import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet, // Import StyleSheet for styles
} from 'react-native';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Assuming this is available for web too, or a web equivalent
import 'leaflet/dist/leaflet.css';

// Fix default marker icons for Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const propertyDetails = {
  B: { name: 'Boron', icon: 'silo' },
  Cu: { name: 'Copper', icon: 'copper' },
  EC: { name: 'Electrical Conductivity', icon: 'flash' },
  Fe: { name: 'Iron', icon: 'iron' },
  K: { name: 'Potassium', icon: 'pot' },
  Mn: { name: 'Manganese', icon: 'molecule' },
  N: { name: 'Nitrogen', icon: 'leaf' },
  OC: { name: 'Organic Carbon', icon: 'leaf-circle' },
  P: { name: 'Phosphorus', icon: 'hexagon-slice-6' },
  pH: { name: 'pH', icon: 'water-percent' },
  S: { name: 'Sulfur', icon: 'flare' },
  Zn: { name: 'Zinc', icon: 'alpha-z-box' },
};

const SoilDashboard = ({ navigation }) => { // Added navigation prop
  const [markerLocation, setMarkerLocation] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const fetchLiveLocation = async () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      Alert.alert('Error', 'Geolocation is not supported by your browser.');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setMarkerLocation(coords);
        setLocationLoading(false);
      },
      (error) => {
        Alert.alert('Error', 'Failed to get location: ' + error.message);
        setLocationLoading(false);
      }
    );
  };

  const fetchSoilData = async () => {
    if (!markerLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }
    setLoading(true);
    setSoilData(null);
    try {
      const url = `https://rest-sisindia.isric.org/sisindia/v1.0/properties/query/gridded?lat=${markerLocation.latitude}&lon=${markerLocation.longitude}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const properties = data.features[0].properties.soil_properties;
      setSoilData(properties);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch soil data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getGradient = (value) => {
    // Updated gradient colors for the property boxes
    const lightGreen = '#80ac45'; // Fresh, leafy green
    const mediumGreen = '#498c39'; // Classic, earthy green
    return [lightGreen, mediumGreen];
  };

  const InteractiveButton = ({ title, onPress, disabled }) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled ? styles.disabledButton : styles.activeButton
      ]}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setMarkerLocation({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        });
      },
    });
    return markerLocation ? (
      <Marker position={[markerLocation.latitude, markerLocation.longitude]} />
    ) : null;
  };

  return (
    <LinearGradient
      colors={['#498c39', '#2e6b21']} // Background gradient: medium green to dark green
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          {/* Back button for navigation */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#f0f0f0" />
          </TouchableOpacity>
          <Text style={styles.title}>🌱 Soil Properties Viewer</Text>
        </View>

        <View style={styles.mapContainer}>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker />
          </MapContainer>
        </View>

        <InteractiveButton
          title={locationLoading ? 'Fetching Location...' : 'Use Live Location'}
          onPress={fetchLiveLocation}
          disabled={locationLoading}
        />

        <InteractiveButton
          title={loading ? 'Fetching Soil Data...' : 'Fetch Soil Data'}
          onPress={fetchSoilData}
          disabled={loading}
        />

        {loading && (
          <ActivityIndicator
            size="large"
            color="#f0f0f0" // Off-white for loading indicator
            style={{ marginTop: 20 }}
          />
        )}

        {soilData && (
          <View style={styles.soilDataContainer}>
            <Text style={styles.heading}>Soil Properties:</Text>
            <View style={styles.grid}>
              {Object.entries(soilData).map(([key, value]) => {
                const details = propertyDetails[key] || { name: key, icon: 'circle' };
                const colors = getGradient(value);
                return (
                  <LinearGradient
                    key={key}
                    colors={colors}
                    style={styles.gridItem}
                  >
                    <MaterialCommunityIcons name={details.icon} size={30} color="#f0f0f0" /> {/* Off-white icon */}
                    <Text style={styles.propertyName}>{details.name}</Text>
                    <Text style={styles.propertyValue}>
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </Text>
                  </LinearGradient>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

// Stylesheet using the new color palette
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50, // Space for potential status bar
  },
  scrollContent: {
    padding: 10,
    paddingBottom: 20, // Add padding at the bottom for better scrolling
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
    padding: 5, // Add padding for easier touch target
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#f0f0f0', // Off-white
  },
  mapContainer: {
    width: '100%',
    height: 400, // Increased height for map on larger screens
    marginBottom: 10,
    borderRadius: 10,
    overflow: 'hidden', // Ensures border radius applies to map
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
  },
  soilDataContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Frosted glass effect
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 18,
    textAlign: 'center',
    color: '#f0f0f0', // Off-white
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  propertyName: {
    fontWeight: '600',
    marginTop: 5,
    fontSize: 16,
    textAlign: 'center',
    color: '#fff', // White
  },
  propertyValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff', // White
  },
  button: {
    paddingVertical: 12,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white border
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Frosted effect
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // More transparent white for disabled state
  },
  buttonText: {
    color: '#fff', // White text
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SoilDashboard;