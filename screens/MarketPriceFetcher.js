// MarketPriceFetcher.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MaterialCommunityIcons,
  FontAwesome5,
  Ionicons,
} from '@expo/vector-icons';
import CustomDropdown from './CustomDropdown';

// Base URL for your API
const API_BASE_URL = 'http://127.0.0.1:5000/market';

const MarketPriceFetcher = () => {
  const [geographies, setGeographies] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [markets, setMarkets] = useState([]);

  const [selectedGeo, setSelectedGeo] = useState(null);
  const [selectedCommodity, setSelectedCommodity] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);

  const [geoOpen, setGeoOpen] = useState(false);
  const [commodityOpen, setCommodityOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);

  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to fetch Geographies
  const fetchGeographies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/geographies`);
      const data = await response.json();
      const formattedData = data.map((item) => ({
        label: `${item.census_state_name} - ${item.census_district_name}`,
        value: item.census_district_id,
        state_id: item.census_state_id,
        state_name: item.census_state_name,
        district_name: item.census_district_name,
      }));
      setGeographies(formattedData);
    } catch (error) {
      console.error('Failed to fetch geographies:', error);
    }
  };

  // Function to fetch Commodities
  const fetchCommodities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/commodities`);
      const data = await response.json();
      const formattedData = data.map((item) => ({
        label: item.commodity_name,
        value: item.commodity_id,
        name: item.commodity_name,
      }));
      setCommodities(formattedData);
    } catch (error) {
      console.error('Failed to fetch commodities:', error);
    }
  };

  // Function to fetch Markets based on selection
  const fetchMarkets = useCallback(async () => {
    if (selectedGeo && selectedCommodity) {
      try {
        const payload = {
          commodity_id: selectedCommodity,
          state_id: geographies.find((g) => g.value === selectedGeo)?.state_id,
          district_id: selectedGeo,
          indicator: 'price',
        };
        const response = await fetch(`${API_BASE_URL}/markets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        const formattedData = data.map((item) => ({
          label: item.market_name,
          value: item.market_id,
          name: item.market_name,
        }));
        setMarkets(formattedData);
        setSelectedMarket(null); // Reset market selection
      } catch (error) {
        console.error('Failed to fetch markets:', error);
        setMarkets([]);
        setSelectedMarket(null);
      }
    }
  }, [selectedGeo, selectedCommodity, geographies]);

  // Function to fetch Prices
  const fetchPrices = async () => {
    if (!selectedGeo || !selectedCommodity || !selectedMarket) {
      return;
    }
    setLoading(true);
    try {
      const today = new Date();
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(today.getDate() - 30);

      const formatDate = (date) => date.toISOString().split('T')[0];

      const payload = {
        commodity_id: selectedCommodity,
        state_id: geographies.find((g) => g.value === selectedGeo)?.state_id,
        district_id: [selectedGeo],
        market_id: [selectedMarket],
        from_date: formatDate(oneMonthAgo),
        to_date: formatDate(today),
      };
      const response = await fetch(`${API_BASE_URL}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setPrices(data);
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchGeographies();
    fetchCommodities();
  }, []);

  // Fetch markets whenever selectedGeo or selectedCommodity changes
  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  const getSelectedNames = () => {
    const geo = geographies.find((g) => g.value === selectedGeo);
    const commodity = commodities.find((c) => c.value === selectedCommodity);
    const market = markets.find((m) => m.value === selectedMarket);
    return {
      state: geo?.state_name || 'None',
      district: geo?.district_name || 'None',
      commodity: commodity?.name || 'None',
      market: market?.name || 'None',
    };
  };

  const selectedNames = getSelectedNames();
  const isButtonDisabled = !selectedGeo || !selectedCommodity || !selectedMarket;

  const renderPriceItem = ({ item }) => (
    <View style={styles.priceRow}>
      <Text style={styles.priceCell}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text style={styles.priceCell}>{selectedNames.commodity}</Text>
      <Text style={styles.priceCell}>{selectedNames.state}</Text>
      <Text style={styles.priceCell}>{selectedNames.district}</Text>
      <Text style={styles.priceCell}>{selectedNames.market}</Text>
      <Text style={styles.priceCell}>{item.min_price}</Text>
      <Text style={styles.priceCell}>{item.max_price}</Text>
      <Text style={styles.priceCell}>{item.modal_price}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#80ac45', '#498c39', '#2e6b21']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={{ zIndex: 3000 }}>
          <View style={styles.headingContainer}>
            <FontAwesome5 name="map-marked-alt" size={24} color="#f0f0f0" />
            <Text style={styles.heading}>Agri Geographies</Text>
          </View>
          <CustomDropdown
            placeholder="Select a state/district..."
            items={geographies}
            value={selectedGeo}
            setValue={setSelectedGeo}
            open={geoOpen}
            setOpen={setGeoOpen}
            zIndex={3000}
            zIndexInverse={1000}
          />
        </View>
        <View style={{ zIndex: 2000 }}>
          <View style={styles.headingContainer}>
            <MaterialCommunityIcons name="seedling" size={24} color="#f0f0f0" />
            <Text style={styles.heading}>Agri Commodities</Text>
          </View>
          <CustomDropdown
            placeholder="Select a commodity..."
            items={commodities}
            value={selectedCommodity}
            setValue={setSelectedCommodity}
            open={commodityOpen}
            setOpen={setCommodityOpen}
            zIndex={2000}
            zIndexInverse={2000}
          />
        </View>
        <View style={{ zIndex: 1000 }}>
          <View style={styles.headingContainer}>
            <Ionicons name="storefront" size={24} color="#f0f0f0" />
            <Text style={styles.heading}>Agri Markets</Text>
          </View>
          <CustomDropdown
            placeholder="Select a market..."
            items={markets}
            value={selectedMarket}
            setValue={setSelectedMarket}
            open={marketOpen}
            setOpen={setMarketOpen}
            disabled={!selectedGeo || !selectedCommodity}
            zIndex={1000}
            zIndexInverse={3000}
          />
        </View>

        <Text style={styles.selectionText}>
          Selected: State - <Text style={styles.bold}>{selectedNames.state}</Text>, District - <Text style={styles.bold}>{selectedNames.district}</Text>, Commodity - <Text style={styles.bold}>{selectedNames.commodity}</Text>, Market - <Text style={styles.bold}>{selectedNames.market}</Text>
        </Text>

        <TouchableOpacity
          style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
          onPress={fetchPrices}
          disabled={isButtonDisabled}
        >
          <Ionicons name="search" size={18} color="#fff" />
          <Text style={styles.buttonText}>Fetch Prices</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#fff" style={styles.loader} />}

        {prices.length > 0 && (
          <ScrollView horizontal={true} contentContainerStyle={styles.tableScrollView}>
            <View style={styles.tableContainer}>
              <View style={styles.tableHeader}>
                <Text style={styles.headerCell}>Date</Text>
                <Text style={styles.headerCell}>Commodity</Text>
                <Text style={styles.headerCell}>State</Text>
                <Text style={styles.headerCell}>District</Text>
                <Text style={styles.headerCell}>Market</Text>
                <Text style={styles.headerCell}>Min Price</Text>
                <Text style={styles.headerCell}>Max Price</Text>
                <Text style={styles.headerCell}>Modal Price</Text>
              </View>
              <FlatList
                data={prices}
                renderItem={renderPriceItem}
                keyExtractor={(item) => item.date.toString()}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#f0f0f0', // Light text for contrast
  },
  selectionText: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    color: '#fff', // White text for contrast
  },
  bold: {
    fontWeight: 'bold',
    color: '#fff',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
    borderWidth: 2,
    borderColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loader: {
    marginTop: 20,
  },
  tableScrollView: {
    paddingBottom: 20,
  },
  tableContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Semi-transparent table background
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: '100%',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Slightly darker header
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 10,
  },
  priceRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 5,
    color: '#fff',
    minWidth: 100,
  },
  priceCell: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 5,
    color: '#fff',
    minWidth: 100,
  },
});

export default MarketPriceFetcher;