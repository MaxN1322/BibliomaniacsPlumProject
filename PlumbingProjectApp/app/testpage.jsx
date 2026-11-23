import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, ScrollView } from "react-native";
import BookImport from "./book-import";

const BACKEND_URL = "https://bibliomaniacsplumproject.onrender.com";

export default function TestPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testRedis = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/redis-test`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Redis test failed");
      }

      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f5f5" }}
      contentContainerStyle={{ padding: 24 }}
    >
      <Text style={{ fontSize: 30, fontWeight: "bold" }}>
        Max's Test Page
      </Text>

      <Text style={{ fontSize: 16, marginVertical: 12 }}>
        Technology Stack Demonstration
      </Text>

      <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 24 }}>
        Redis Implementation
      </Text>

      <Text style={{ marginVertical: 12 }}>
        Test whether Redis can store and retrieve cached data.
      </Text>

      <Pressable
        onPress={testRedis}
        disabled={loading}
        style={{
          backgroundColor: "#2563eb",
          padding: 16,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          {loading ? "Testing..." : "Test Redis Connection"}
        </Text>
      </Pressable>

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}

      {result && (
        <View
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "white",
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Test Results
          </Text>

          {result.error ? (
            <Text style={{ color: "red", marginTop: 8 }}>
              Error: {result.error}
            </Text>
          ) : (
            <>
              <Text style={{ marginTop: 8 }}>
                Redis: {result.redis}
              </Text>
              <Text>
                Write: {result.write}
              </Text>
              <Text>
                Read: {result.read}
              </Text>
            </>
          )}
        </View>
      )}

      <View style={{ marginTop: 32 }}>
        <BookImport />
      </View>
    </ScrollView>
  );
}