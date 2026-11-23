
import { View, Text } from "react-native";
import BookImport from "./book-import";

export default function TestPage() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f5f5f5",
      }}
    >
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 32, fontWeight: "bold" }}>
          Max's Test Page:
        </Text>
        <Text style={{ fontSize: 16, marginTop: 12 }}>Hi Gabe</Text>
      </View>
      <BookImport />
    </View>
  );
}
