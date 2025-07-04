import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function ProfileDashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>📘 My Dashboard</Text>
      <Text style={styles.subHeader}>Here's your weekly overview 👇</Text>

      {/* Wellness Card */}
      <View style={styles.cardOrange}>
        <Text style={styles.cardTitle}>🔥 Wellness Streak</Text>
        <Text style={styles.cardText}>✅ 2 Days in a Row! Keep it up!</Text>
      </View>

      {/* Weekly Tasks Bar Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>📊 Weekly Task Completion</Text>
        <BarChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              {
                data: [4, 6, 5, 3, 2, 4, 7],
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          fromZero
          style={styles.chartStyle}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>

      {/* Monthly Line Chart */}
      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>📈 Monthly Progress</Text>
        <LineChart
          data={{
            labels: ["W1", "W2", "W3", "W4"],
            datasets: [
              {
                data: [60, 70, 85, 90],
              },
            ],
          }}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chartStyle}
        />
      </View>

      {/* Motivation */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>
          "Success is the sum of small efforts, repeated day in and day out."
        </Text>
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`,
  labelColor: () => "#333",
  barPercentage: 0.6,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#1e90ff",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9FAFB",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  cardOrange: {
    backgroundColor: "#FFEFD5",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  chartCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  quoteCard: {
    backgroundColor: "#E0F7FA",
    padding: 16,
    borderRadius: 16,
    marginBottom: 30,
    alignItems: "center",
  },
  quoteText: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#00796B",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  chartStyle: {
    borderRadius: 16,
  },
});
