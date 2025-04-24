import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  VideoLibrary,
} from "@mui/icons-material";
import axios from "axios";

const Summarizer = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFileSelect = (file) => {
    if (!file.type.startsWith("video/")) {
      alert("Only video files are allowed!");
      return;
    }
    setVideoFile(file);
    setSummary(""); // Reset previous summary
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSummarize = async () => {
    if (!videoFile) return;
    const formData = new FormData();
    formData.append("video", videoFile);

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/users/summarize/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSummary(response.data.summary);
    } catch (error) {
      console.error(error);
      setSummary("❌ Error occurred during summarization.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setVideoFile(null);
    setSummary("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "#f0f2f5",
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          width: 420,
          maxWidth: "95%",
          borderRadius: 3,
          background: "#fff",
        }}
      >
        <Typography variant="h6" textAlign="center" gutterBottom>
          AI Video Summarizer
        </Typography>

        {/* Drag-and-drop upload area */}
        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          sx={{
            border: "2px dashed #bdbdbd",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: "#fafafa",
          }}
          onClick={() => inputRef.current.click()}
        >
          <CloudUpload fontSize="large" color="primary" />
          <Typography fontWeight="bold" mt={1}>
            Upload your file here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported: MP4, MOV, AVI
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click or drag and drop to upload
          </Typography>

          <input
            type="file"
            accept="video/*"
            hidden
            ref={inputRef}
            onChange={handleFileChange}
          />
        </Box>

        {/* Uploaded file preview */}
        {videoFile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#f5f5f5",
              borderRadius: 1,
              px: 2,
              py: 1.5,
              mt: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <VideoLibrary color="primary" />
              <Typography variant="body2">{videoFile.name}</Typography>
            </Box>
            <IconButton color="error" onClick={handleRemoveFile}>
              <Delete />
            </IconButton>
          </Box>
        )}

        {/* Button to summarize */}
        <Box textAlign="center" mt={3}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSummarize}
            disabled={!videoFile || loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Summarize"}
          </Button>
        </Box>

        {/* Display summary */}
        {summary && (
          <Box mt={3}>
            <Typography variant="h6">Summary:</Typography>
            <Typography variant="body2" mt={1} sx={{ whiteSpace: "pre-line" }}>
              {summary}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Summarizer;
