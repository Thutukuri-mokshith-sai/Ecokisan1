// WeatherDashboard.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import * as Location from 'expo-location'; // Import the location library

const screenWidth = Dimensions.get('window').width;

const getIconName = (rain) => {
  if (rain > 5) return 'weather-pouring';
  if (rain > 0) return 'weather-partly-cloudy';
  return 'weather-sunny';
};

export default function WeatherDashboard() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      // 1. Fetch location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError("Permission to access location was denied. Cannot fetch weather data.");
        Alert.alert('Location Permission Required', 'Please enable location services to use this app.');
        setLoading(false);
        return;
      }

      let currentLocation;
      try {
        currentLocation = await Location.getCurrentPositionAsync({});
      } catch (e) {
        setError("Failed to get current location.");
        setLoading(false);
        return;
      }

      const { latitude, longitude } = currentLocation.coords;

      // 2. Fetch weather using the fetched location
      const ARCHIVE_API = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=2025-09-08&end_date=2025-09-15&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
      const FORECAST_API = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean&timezone=Asia/Kolkata`;

      try {
        const [archiveRes, forecastRes] = await Promise.all([
          fetch(ARCHIVE_API),
          fetch(FORECAST_API)
        ]);
        const archiveData = await archiveRes.json();
        const forecastData = await forecastRes.json();
        setWeatherData({ archiveData, forecastData });
      } catch (e) {
        setError("Failed to fetch weather data.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // Empty dependency array means this runs only once on mount

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Fetching location and weather data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const { archiveData, forecastData } = weatherData;
  const { daily } = archiveData;
  const { daily: today } = forecastData;

  const getRainNote = (rain) => {
    if (rain > 5) return "Reduce irrigation";
    if (rain === 0) return "Irrigation needed";
    return "Light showers";
  };

  const getTableNote = (rain, maxT) => {
    if (maxT > 35) return "Hot day, increased irrigation needed";
    if (rain > 10) return "Heavy rainfall, good soil moisture";
    if (rain > 0) return "Light showers, moderate irrigation";
    return "Dry day, irrigation needed";
  };

  const tempChartData = {
    labels: daily.time.map(d => d.slice(5)),
    datasets: [
      { data: daily.temperature_2m_max, color: () => '#ff6384', strokeWidth: 2 },
      { data: daily.temperature_2m_min, color: () => '#36a2eb', strokeWidth: 2 }
    ],
    legend: ["Max Temp (°C)", "Min Temp (°C)"]
  };

  const rainChartData = {
    labels: daily.time.map(d => d.slice(5)),
    datasets: [{ data: daily.precipitation_sum }],
  };

  const hourlyTempChartData = {
    labels: forecastData.hourly.time.slice(0, 24).map(t => t.slice(11, 16)),
    datasets: [{ data: forecastData.hourly.temperature_2m.slice(0, 24) }]
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.header}>
        <Text style={styles.headerText}>🌦 Farmer Weather Dashboard</Text>
      </View>

      {/* Top Cards */}
      <View style={styles.topCardsGrid}>
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Icon name={getIconName(today.precipitation_sum[0])} size={45} color={today.precipitation_sum[0] > 0 ? '#36a2eb' : '#ffce56'} />
            <Text style={styles.cardTitle}>Today</Text>
            <Text style={styles.cardText}>{today.time[0]}</Text>
            <Text style={styles.cardSmallText}>Max: {today.temperature_2m_max[0]}°C | Min: {today.temperature_2m_min[0]}°C</Text>
          </View>
        </Card>
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Icon name="weather-rainy" size={45} color="#4A90E2" />
            <Text style={styles.cardTitle}>Rain</Text>
            <Text style={styles.cardText}>{today.precipitation_sum[0]} mm</Text>
            <Text style={styles.cardSmallText}>{getRainNote(today.precipitation_sum[0])}</Text>
          </View>
        </Card>
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Icon name="water-percent" size={45} color="#50E3C2" />
            <Text style={styles.cardTitle}>Humidity</Text>
            <Text style={styles.cardText}>{today.relative_humidity_2m_mean[0]}%</Text>
          </View>
        </Card>
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <Icon name="weather-windy" size={45} color="#B8B8B8" />
            <Text style={styles.cardTitle}>Wind</Text>
            <Text style={styles.cardText}>{forecastData.hourly.wind_speed_10m[0]} km/h</Text>
          </View>
        </Card>
      </View>

      {/* Charts */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily Temperature</Text>
        <LineChart data={tempChartData} width={screenWidth - 40} height={220} chartConfig={chartConfig} />
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Daily Rainfall</Text>
        <BarChart data={rainChartData} width={screenWidth - 40} height={220} chartConfig={{...chartConfig, barPercentage: 0.5}}/>
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Hourly Temperature Forecast</Text>
        <LineChart data={hourlyTempChartData} width={screenWidth - 40} height={220} chartConfig={{...chartConfig, color: () => 'orange'}} />
      </View>

      {/* Summary Table (replicated with Views) */}
      <Text style={styles.tableTitle}>📅 Past 7 Days Summary</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableHeaderCell}>Date</Text>
          <Text style={styles.tableHeaderCell}>Max Temp (°C)</Text>
          <Text style={styles.tableHeaderCell}>Min Temp (°C)</Text>
          <Text style={styles.tableHeaderCell}>Rain (mm)</Text>
          <Text style={styles.tableHeaderCell}>Notes</Text>
        </View>
        {daily.time.map((d, i) => (
          <View key={d} style={[styles.tableRow, daily.temperature_2m_max[i] > 35 && styles.rowDanger]}>
            <Text style={styles.tableCell}>{d}</Text>
            <Text style={styles.tableCell}>{daily.temperature_2m_max[i]}</Text>
            <Text style={styles.tableCell}>{daily.temperature_2m_min[i]}</Text>
            <Text style={styles.tableCell}>{daily.precipitation_sum[i]}</Text>
            <Text style={styles.tableCell}>{getTableNote(daily.precipitation_sum[i], daily.temperature_2m_max[i])}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
const chartConfig = {
  backgroundGradientFrom: '#aadcbdff', // light green
  backgroundGradientTo: '#9ba6a2ff',   // medium green
  color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`, // forest green lines
  labelColor: (opacity = 1) => `rgba(0, 100, 0, ${opacity})`, // darker green labels
  propsForBackgroundLines: { strokeDasharray: '', stroke: 'rgba(0,100,0,0.2)' },
  decimalPlaces: 1,
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#3f613dff',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  topCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginHorizontal: 10,
    marginBottom: 20,
  },
  card: {
    width: '45%',
    marginBottom: 10,
    borderRadius: 15,
    elevation: 4,
  },
  cardContent: {
    padding: 15,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: 16,
  },
  cardSmallText: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    elevation: 4,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  table: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#212529',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    fontSize: 12,
  },
  rowDanger: {
    backgroundColor: '#f8d7da',
  },
});