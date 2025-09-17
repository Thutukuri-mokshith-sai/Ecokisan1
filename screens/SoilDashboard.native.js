import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity 
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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

const SoilDashboard = ({ navigation }) => {
  const [markerLocation, setMarkerLocation] = useState(null);
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const mapRef = useRef(null);

  const fetchLiveLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to fetch soil data.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setMarkerLocation(coords);

      mapRef.current.animateToRegion({
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get location: ' + error.message);
    } finally {
      setLocationLoading(false);
    }
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
    const intensity = Math.min(0.3 + value / 100, 1);
    const darkGreen = 'rgba(46, 107, 33, 1)';
    const lightGreen = 'rgba(128, 172, 69, 1)';
    const mediumGreen = 'rgba(73, 140, 57, 1)';
    
    // A more subtle, consistent gradient for the boxes
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

  return (
    <LinearGradient
      colors={['#498c39', '#2e6b21']} // Updated background gradient
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#f0f0f0" />
          </TouchableOpacity>
          <Text style={styles.title}>🌱 Soil Properties Viewer</Text>
        </View>

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 20.5937,
            longitude: 78.9629,
            latitudeDelta: 10,
            longitudeDelta: 10,
          }}
          onPress={(e) => setMarkerLocation(e.nativeEvent.coordinate)}
        >
          {markerLocation && <Marker coordinate={markerLocation} />}
        </MapView>

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

        {loading && <ActivityIndicator size="large" color="#f0f0f0" style={{ marginTop: 20 }} />}

        {soilData && (
          <View style={styles.soilDataContainer}>
            <Text style={styles.heading}>Soil Properties:</Text>
            <View style={styles.grid}>
              {Object.entries(soilData).map(([key, value]) => {
                const details = propertyDetails[key] || { name: key, icon: 'circle' };
                return (
                  <LinearGradient
                    key={key}
                    colors={getGradient(value)}
                    style={styles.gridItem}
                  >
                    <MaterialCommunityIcons name={details.icon} size={30} color="#f0f0f0" />
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

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingTop: 50,
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
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#f0f0f0', // Off-white
  },
  map: { 
    width: '100%', 
    height: 300, 
    marginBottom: 10, 
    borderRadius: 10,
    borderColor: 'rgba(255, 255, 255, 0.2)', // Border for the map
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
    elevation: 3,
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
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // More transparent white
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16, 
  },
});

export default SoilDashboard;