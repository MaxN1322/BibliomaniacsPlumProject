import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:5001"
).trim().replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 15000;

async function fetchJsonWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const data = await readJsonResponse(response);
    return { response, data };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readJsonResponse(response) {
  const body = await response.text();
  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw new Error(`Backend returned an unreadable response (${response.status}).`);
  }
}

function requestErrorMessage(error) {
  if (error?.name === "AbortError") {
    return "The backend did not respond within 15 seconds. Check that it is running and try again.";
  }
  return error?.message || "Could not reach the backend. Check your connection and try again.";
}

const styles = {
  page: { flex: 1, backgroundColor: "#f8fbf7" },
  content: { width: "100%", maxWidth: 1040, alignSelf: "center", padding: 24, gap: 20 },
  title: { color: "#183b2c", fontSize: 30, fontWeight: "700" },
  intro: { color: "#647067", fontSize: 15, marginTop: 6, lineHeight: 22 },
  card: { backgroundColor: "white", borderColor: "#e2e9e3", borderWidth: 1, borderRadius: 16, padding: 20, gap: 14 },
  sectionTitle: { color: "#183b2c", fontSize: 19, fontWeight: "600" },
  label: { color: "#34443a", fontWeight: "600", marginBottom: 7 },
  input: { minHeight: 44, borderWidth: 1, borderColor: "#cbd5ce", borderRadius: 9, backgroundColor: "white", paddingHorizontal: 12, color: "#17251b" },
  fileInput: { minHeight: 44, width: "100%", color: "#34443a" },
  button: { alignSelf: "flex-start", backgroundColor: "#246b45", borderRadius: 9, paddingVertical: 12, paddingHorizontal: 18 },
  buttonDisabled: { opacity: 0.55 },
  buttonText: { color: "white", fontWeight: "700" },
  status: { fontSize: 14, lineHeight: 20 },
  error: { color: "#b42318" },
  success: { color: "#216e3a" },
  muted: { color: "#647067", fontSize: 14 },
  row: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomColor: "#edf1ed", borderBottomWidth: 1 },
  headerRow: { backgroundColor: "#f2f6f2", borderRadius: 8, paddingHorizontal: 10 },
  cell: { flex: 1, color: "#26362b", fontSize: 14 },
  headerCell: { color: "#4e5e52", fontWeight: "700" },
};

export default function BookImport({ embedded = false }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState(false);
  const [search, setSearch] = useState("");
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [listError, setListError] = useState("");

  const fetchBooks = useCallback(async (term = "") => {
    setLoadingBooks(true);
    setListError("");
    try {
      const params = new URLSearchParams();
      if (term.trim()) params.set("q", term.trim());
      const suffix = params.toString() ? `?${params.toString()}` : "";
      const { response, data } = await fetchJsonWithTimeout(`${API_BASE_URL}/api/books${suffix}`);
      if (!response.ok) throw new Error(data.error || "Could not load books.");
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      setListError(`${requestErrorMessage(error)} Backend URL: ${API_BASE_URL}`);
    } finally {
      setLoadingBooks(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchBooks(search), 250);
    return () => clearTimeout(timer);
  }, [fetchBooks, search]);

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError(true);
      setUploadStatus("Choose a PDF file before uploading.");
      return;
    }

    setUploading(true);
    setUploadError(false);
    setUploadStatus("Uploading and extracting book titles…");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const { response, data } = await fetchJsonWithTimeout(`${API_BASE_URL}/api/books/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      const count = data.count ?? data.books?.length ?? 0;
      setUploadStatus(`Upload complete. ${count} book${count === 1 ? "" : "s"} saved.`);
      setSelectedFile(null);
      setFileInputKey((key) => key + 1);
      await fetchBooks(search);
    } catch (error) {
      setUploadError(true);
      setUploadStatus(requestErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const content = (
    <View style={styles.content}>
        <View>
          <Text style={styles.title}>Book List Import</Text>
          <Text style={styles.intro}>
            Upload a recommendation-list PDF, then search the books saved from it.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Upload a PDF list</Text>
          {Platform.OS === "web" ? (
            <View>
              <Text style={styles.label}>PDF file</Text>
              <input
                key={fileInputKey}
                aria-label="Choose a PDF book list"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => {
                  setSelectedFile(event.target.files?.[0] || null);
                  setUploadStatus("");
                }}
                style={styles.fileInput}
              />
              {selectedFile ? (
                <Text style={styles.muted}>{selectedFile.name}</Text>
              ) : null}
            </View>
          ) : (
            <Text style={styles.muted}>PDF file upload is available in the web app.</Text>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={uploading || Platform.OS !== "web"}
            onPress={handleUpload}
            style={[styles.button, (uploading || Platform.OS !== "web") && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>{uploading ? "Uploading…" : "Upload PDF"}</Text>
          </Pressable>
          {uploadStatus ? (
            <Text style={[styles.status, uploadError ? styles.error : styles.success]}>
              {uploadStatus}
            </Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Search saved books</Text>
          <View>
            <Text style={styles.label}>Search title or author</Text>
            <TextInput
              accessibilityLabel="Search books by title or author"
              placeholder="Type a title or author…"
              value={search}
              onChangeText={setSearch}
              style={styles.input}
            />
          </View>

          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell]}>Title</Text>
            <Text style={[styles.cell, styles.headerCell]}>Author</Text>
          </View>

          {loadingBooks ? (
            <ActivityIndicator color="#246b45" />
          ) : listError ? (
            <Text style={[styles.status, styles.error]}>{listError}</Text>
          ) : books.length === 0 ? (
            <Text style={styles.muted}>No books found.</Text>
          ) : (
            books.map((book) => (
              <View key={book.id || `${book.title}-${book.author}`} style={styles.row}>
                <Text style={styles.cell}>{book.title || "Untitled"}</Text>
                <Text style={styles.cell}>{book.author || "Unknown"}</Text>
              </View>
            ))
          )}
        </View>
    </View>
  );

  if (embedded) {
    return <View style={{ width: "100%", backgroundColor: styles.page.backgroundColor }}>{content}</View>;
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ flexGrow: 1 }}>
      {content}
    </ScrollView>
  );
}
