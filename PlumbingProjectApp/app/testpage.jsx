
import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import BookImport from "./book-import";

const BACKEND_URL =
  "https://bibliomaniacsplumproject.onrender.com";

export default function TestPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [cronResult, setCronResult] = useState(null);
  const [cronLoading, setCronLoading] = useState(false);

  // Firebase / ParseHub state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

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

  const testCron = async () => {
    setCronLoading(true);
    setCronResult(null);

    try {
      const response = await fetch(
        "https://bibliomaniacs-cron-demo.onrender.com/"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Cron demo request failed");
      }

      setCronResult(data);
    } catch (error) {
      setCronResult({ error: error.message });
    } finally {
      setCronLoading(false);
    }
  };

  // Retrieve reviews from Firebase through Flask
  const fetchReviews = async () => {
    setReviewsLoading(true);
    setReviewsError(null);

    try {
      const response = await fetch(
        `${BACKEND_URL}/get_parsehub_reviews`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Server returned ${response.status}`
        );
      }

      // Support either an array or an object containing reviews
      const reviewData = Array.isArray(data)
        ? data
        : data.reviews;

      if (!Array.isArray(reviewData)) {
        throw new Error(
          "Unexpected response format from the backend."
        );
      }

      setReviews(reviewData);
    } catch (error) {
      console.error("Firebase reviews error:", error);
      setReviewsError(error.message);
    } finally {
      setReviewsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 24 }}
      >
        <Text style={{ fontSize: 30, fontWeight: "bold" }}>
          Max's Test Page
        </Text>

        <Text style={{ fontSize: 16, marginVertical: 12 }}>
          Technology Stack Demonstration
        </Text>

        {/* REDIS IMPLEMENTATION */}

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
          <View style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "white",
            borderRadius: 8,
          }}>
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
                <Text>Write: {result.write}</Text>
                <Text>Read: {result.read}</Text>
              </>
            )}
          </View>
        )}

        {/* CRON JOB IMPLEMENTATION */}

        <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 24 }}>
          Cron Job Implementation
        </Text>

        <Text style={{ marginVertical: 12 }}>
          Check the latest response from our deployed Cron Job demo.
        </Text>

        <Pressable
          onPress={testCron}
          disabled={cronLoading}
          style={{
            backgroundColor: "#16a34a",
            padding: 16,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {cronLoading ? "Checking..." : "Check Cron Job"}
          </Text>
        </Pressable>

        {cronLoading && (
          <ActivityIndicator style={{ marginTop: 16 }} />
        )}

        {cronResult && (
          <View style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "white",
            borderRadius: 8,
          }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Cron Job Results
            </Text>

            {cronResult.error ? (
              <Text style={{ color: "red", marginTop: 8 }}>
                Error: {cronResult.error}
              </Text>
            ) : (
              <>
                <Text style={{ marginTop: 8 }}>
                  Message: {cronResult.message}
                </Text>
                <Text style={{ marginTop: 8 }}>
                  Status: Successfully reached backend
                </Text>
                <Text style={{ marginTop: 8 }}>
                  Timestamp: {new Date(cronResult.timestamp).toLocaleString()}
                </Text>
              </>
            )}
          </View>
        )}

        {/* FIREBASE / PARSEHUB IMPLEMENTATION */}

        <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 32 }}>
          Firebase / ParseHub Reviews
        </Text>

        <Text style={{ marginVertical: 12 }}>
          Retrieve reviews stored in Firestore through our Flask backend.
        </Text>

        <Pressable
          onPress={fetchReviews}
          disabled={reviewsLoading}
          style={{
            backgroundColor: "#7c3aed",
            padding: 16,
            borderRadius: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {reviewsLoading ? "Loading Reviews..." : "Fetch Firebase Reviews"}
          </Text>
        </Pressable>

        {reviewsLoading && (
          <ActivityIndicator style={{ marginTop: 16 }} />
        )}

        {reviewsError && (
          <View style={{
            marginTop: 16,
            padding: 16,
            backgroundColor: "white",
            borderRadius: 8,
          }}>
            <Text style={{ color: "red" }}>
              Error: {reviewsError}
            </Text>
          </View>
        )}

        {!reviewsLoading && !reviewsError && reviews.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Retrieved Reviews: {reviews.length}
            </Text>

            {reviews.map((review, index) => (
              <View
                key={review.id || index}
                style={{
                  marginTop: 12,
                  padding: 16,
                  backgroundColor: "white",
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
                  Review {index + 1}
                </Text>

                <Text>
                  {review.name ||
                    review.review ||
                    review.title ||
                    JSON.stringify(review)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {!reviewsLoading &&
          !reviewsError &&
          reviews.length === 0 && (
            <Text style={{ marginTop: 16, color: "#666" }}>
              Press the button to retrieve your Firebase reviews.
            </Text>
          )}

        {/* EXISTING BOOK IMPORT COMPONENT */}

        <View style={{ marginTop: 32 }}>
          <BookImport embedded />
        </View>

      </ScrollView>
    </View>
  );
}