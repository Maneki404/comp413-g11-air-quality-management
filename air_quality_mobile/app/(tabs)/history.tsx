import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase";
import { Colors } from "@/constants/Colors";
import { moderateScale } from "@/helpers/responsive";
import { MaterialIcons } from "@expo/vector-icons";

interface SensorReading {
  id: string;
  temperature: number;
  humidity: number;
  airQuality: number;
  timestamp: string;
}

export default function HistoryScreen() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const deleteAllReadings = async () => {
    Alert.alert(
      "Delete All Readings",
      "Are you sure you want to delete all historical readings? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              // Get all documents
              const q = query(
                collection(db, "sensor_readings"),
                orderBy("timestamp", "desc")
              );

              const querySnapshot = await getDocs(q);

              // Firestore batch only allows 500 operations at once
              const batch = writeBatch(db);
              let count = 0;

              querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
                count++;
              });

              await batch.commit();

              // Clear local state
              setReadings([]);
              Alert.alert("Success", `Deleted ${count} readings`);
            } catch (error) {
              console.error("Error deleting readings:", error);
              Alert.alert("Error", "Failed to delete readings");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const fetchReadings = async () => {
    try {
      const q = query(
        collection(db, "sensor_readings"),
        orderBy("timestamp", "desc"),
        limit(50) // Adjust limit as needed
      );

      const querySnapshot = await getDocs(q);
      const data: SensorReading[] = [];

      querySnapshot.forEach((doc) => {
        const reading = doc.data();
        data.push({
          id: doc.id,
          temperature: reading.temperature?.doubleValue || reading.temperature,
          humidity: reading.humidity?.doubleValue || reading.humidity,
          airQuality: reading.airQuality?.integerValue || reading.airQuality,
          timestamp: reading.timestamp?.stringValue || reading.timestamp,
        });
      });

      setReadings(data);
    } catch (error) {
      console.error("Error fetching readings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReadings();
  };

  const getAirQualityStatus = (airQuality: number) => {
    // Reuse your air quality calculation logic here
    const percentage = calculateAirQualityPercentage(airQuality);
    console.warn(airQuality);
    if (percentage < 10) return { status: "Hazardous", color: "#FF0000" };
    if (percentage < 25) return { status: "Very Poor", color: "#FF4500" };
    if (percentage < 50) return { status: "Poor", color: "#FFA500" };
    if (percentage < 70) return { status: "Moderate", color: "#FFFF00" };
    if (percentage < 90) return { status: "Good", color: "#90EE90" };
    return { status: "Excellent", color: "#00FF00" };
  };

  const calculateAirQualityPercentage = (airQuality: number) => {
    const maxValue = 4095; // Maximum analog reading
    const minValue = 0; // Minimum analog reading
    return (
      100 - Math.round(((airQuality - minValue) / (maxValue - minValue)) * 100)
    );
  };

  const renderItem = ({ item }: { item: SensorReading }) => {
    const airQualityStatus = getAirQualityStatus(item.airQuality);
    const date = new Date(item.timestamp);

    const dateOptions: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Europe/Istanbul",
    };

    return (
      <View style={styles.readingCard}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {date.toLocaleDateString("tr-TR", dateOptions)}
          </Text>
          <Text style={styles.timeText}>
            {date.toLocaleTimeString("tr-TR", timeOptions)}
          </Text>
        </View>

        <View style={styles.readingsContainer}>
          <View style={styles.readingItem}>
            <Text style={styles.label}>Temperature</Text>
            <Text style={styles.value}>{item.temperature}°C</Text>
          </View>

          <View style={styles.readingItem}>
            <Text style={styles.label}>Humidity</Text>
            <Text style={styles.value}>{item.humidity}%</Text>
          </View>

          <View style={styles.readingItem}>
            <Text style={styles.label}>Air Quality</Text>
            <Text style={[styles.value, { color: airQualityStatus.color }]}>
              {airQualityStatus.status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={"red"} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reading History</Text>
        <TouchableOpacity
          onPress={deleteAllReadings}
          style={styles.deleteButton}
        >
          <Text style={styles.buttonText}>Delete History </Text>
          <MaterialIcons name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={readings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={"blue"}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No readings available</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: "PoppinsSemiBold",
    color: "white",
    textAlign: "center",
    marginVertical: 20,
  },
  listContainer: {
    padding: 16,
  },
  readingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dateContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    paddingBottom: 8,
    marginBottom: 12,
  },
  dateText: {
    fontSize: moderateScale(16),
    fontFamily: "PoppinsSemiBold",
    color: "white",
  },
  timeText: {
    fontSize: moderateScale(14),
    fontFamily: "Poppins",
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  readingsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  readingItem: {
    flex: 1,
    minWidth: "33%",
    padding: 8,
  },
  label: {
    fontSize: moderateScale(12),
    fontFamily: "Poppins",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  value: {
    fontSize: moderateScale(16),
    fontFamily: "PoppinsSemiBold",
    color: "white",
  },
  emptyText: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: moderateScale(16),
    fontFamily: "Poppins",
    marginTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  deleteButton: {
    padding: 8,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: "Poppins",
    fontSize: moderateScale(12),
    color: "red",
    top: 2,
  },
});
