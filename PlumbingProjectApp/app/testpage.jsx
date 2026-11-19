
import { View, Text } from "react-native";

export default function TestPage() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        padding: 24,
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: "bold" }}>
        Max's Test Page:
      </Text>

      <Text style={{ fontSize: 16, marginTop: 12 }}>
        Hi Gabe
      </Text>
    </View>
  );
}
