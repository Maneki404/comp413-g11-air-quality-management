import { Colors } from "@/constants/Colors";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { moderateScale } from "@/helpers/responsive";
import { Gauge } from "@/components/Gauge";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase";

interface SensorData {
  temperature: number;
  humidity: number;
  airQuality: number;
  timestamp: string;
}

const formatDateTime = (timestamp: string) => {
  const date = new Date(timestamp);

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Istanbul",
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  };

  const time = date.toLocaleTimeString("tr-TR", timeOptions);
  const dateStr = date.toLocaleDateString("tr-TR", dateOptions);

  return `${dateStr} - ${time}`;
};

export default function HomeScreen() {
  // Add window dimensions
  const { width, height } = useWindowDimensions();

  // Calculate responsive gauge size
  const calculateGaugeSize = () => {
    const screenWidth = width;
    const screenHeight = height;

    // Use the smaller dimension to ensure gauge fits on screen
    const smallerDimension = Math.min(screenWidth, screenHeight);

    // Gauge should be proportional to screen size but not too large
    const gaugeRadius = Math.round(smallerDimension * 0.25); // Adjust multiplier as needed

    return gaugeRadius;
  };

  const animatedValue = useRef(new Animated.Value(0)).current;
  const [currentPercent, setCurrentPercent] = useState(0);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateAirQualityPercentage = (airQuality: number) => {
    const maxValue = 4095; // Maximum analog reading
    const minValue = 0; // Minimum analog reading
    return (
      100 - Math.round(((airQuality - minValue) / (maxValue - minValue)) * 100)
    );
  };

  useEffect(() => {
    if (sensorData) {
      console.log("Temperature:", sensorData.temperature);
    }
  }, [sensorData]);

  useFocusEffect(
    useCallback(() => {
      const q = query(
        collection(db, "sensor_readings"),
        orderBy("timestamp", "desc"),
        limit(1)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            console.log("Raw Firestore data:", data);

            try {
              const newSensorData = {
                temperature: data.temperature?.doubleValue || data.temperature,
                humidity: data.humidity?.doubleValue || data.humidity,
                airQuality: data.airQuality?.integerValue || data.airQuality,
                timestamp: data.timestamp?.stringValue || data.timestamp,
              };
              console.log("Processed sensor data:", newSensorData);
              setSensorData(newSensorData);

              // Calculate new air quality percentage and animate the gauge
              const newPercent = calculateAirQualityPercentage(
                newSensorData.airQuality
              );
              animatedValue.setValue(0); // Reset animation
              Animated.timing(animatedValue, {
                toValue: newPercent,
                duration: 1500,
                useNativeDriver: false,
              }).start();
            } catch (error) {
              console.error("Error processing data:", error);
            }
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching sensor data:", error);
          setLoading(false);
        }
      );

      const listener = animatedValue.addListener(({ value }) => {
        setCurrentPercent(Math.round(value));
      });

      return () => {
        unsubscribe();
        animatedValue.removeListener(listener);
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, Aslı</Text>
      <Text style={styles.titleText}>Air Quality {"\n"}Performance Score</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={"red"} />
        </View>
      ) : (
        <View>
          <View style={styles.gaugeContainer}>
            <Gauge percent={currentPercent} radius={calculateGaugeSize()} />
          </View>

          {sensorData && (
            <View style={styles.readingsContainer}>
              <View style={styles.readingCardTemperature}>
                <Text style={styles.readingLabel}>Temperature</Text>
                <Text style={styles.readingValue}>
                  {sensorData.temperature}°C
                </Text>
              </View>

              <View style={styles.readingCardHumidity}>
                <Text style={styles.readingLabel}>Humidity</Text>
                <Text style={styles.readingValue}>{sensorData.humidity}%</Text>
              </View>

              <Text style={styles.timestampText}>
                Last Updated: {formatDateTime(sensorData.timestamp)}
              </Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: Colors.background,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  welcomeText: {
    color: "white",
    fontSize: moderateScale(15),
    fontFamily: "Poppins",
    textAlign: "center",
  },
  titleText: {
    color: "white",
    fontSize: moderateScale(25),
    fontFamily: "PoppinsExtraLight",
    textAlign: "center",
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gaugeContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  readingsContainer: {
    marginTop: 40,
    padding: 20,
    borderRadius: 15,
  },
  readingCardTemperature: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    padding: 25,
    backgroundColor: "rgba(249,210,107,255)",
    borderRadius: 20,
  },
  readingCardHumidity: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    padding: 25,
    backgroundColor: "rgba(98,163,247,255)",
    borderRadius: 20,
  },
  readingLabel: {
    color: "black",
    fontSize: moderateScale(16),
    fontFamily: "Poppins",
    top: "7%",
  },
  readingValue: {
    color: "black",
    fontSize: moderateScale(20),
    fontFamily: "PoppinsBlack",
    top: "10%",
  },
  timestampText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: moderateScale(12),
    fontFamily: "Poppins",
    textAlign: "center",
    marginTop: 10,
  },
});
