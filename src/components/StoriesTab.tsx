"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { speak } from "@/lib/tts";
import type { Story } from "@/types/content";

function cleanWord(w: string) {
  return w.replace(/[^a-zA-Z']/g, "");
}

type Props = {
  stories: Story[];
  loading: boolean;
  read: string[];
  recordProgress: (type: "story", itemId: string) => void;
};

export function StoriesTab({ stories, loading, read, recordProgress }: Props) {
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  const openStory = (s: Story) => {
    setActiveStory(s);
    if (!read.includes(s.id)) {
      recordProgress("story", s.id);
    }
  };

  const handleWordClick = async (word: string, key: string) => {
    const clean = cleanWord(word);
    if (!clean) return;
    setSpeakingWord(key);
    await speak(clean, undefined, () => setSpeakingWord(null));
    setTimeout(() => setSpeakingWord(null), 1200);
  };

  const readWholeStory = async () => {
    if (!activeStory) return;
    await speak(activeStory.content);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 240 }}>
        <CircularProgress size={48} color="primary" />
      </Box>
    );
  }

  if (activeStory) {
    const chunks = activeStory.content.split(/(\s+)/);
    return (
      <Box data-testid="story-view">
        <Stack sx={{ flexDirection: "row", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            color="inherit"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => setActiveStory(null)}
            data-testid="back-to-stories"
            sx={{ borderRadius: 99 }}
          >
            Stories
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<VolumeUpIcon />}
            onClick={readWholeStory}
            data-testid="read-whole-story"
            sx={{ borderRadius: 99 }}
          >
            Read aloud
          </Button>
        </Stack>

        <Card variant="outlined" sx={{ borderRadius: 3, borderWidth: 2, overflow: "hidden" }}>
          <Box
            sx={{
              px: 2,
              py: 2.5,
              background: (theme) =>
                `linear-gradient(120deg, ${theme.palette.info.main} 0%, ${theme.palette.primary.main} 100%)`,
              color: "common.white",
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: "3rem", lineHeight: 1 }}>{activeStory.emoji || "📖"}</Typography>
            <Typography variant="h5" sx={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>
              {activeStory.title}
            </Typography>
          </Box>
          <CardContent sx={{ py: 3 }}>
            <Typography
              component="div"
              variant="body1"
              sx={{
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
                lineHeight: 1.75,
                fontWeight: 600,
              }}
            >
              {chunks.map((chunk, i) => {
                if (/^\s+$/.test(chunk)) return <span key={i}>{chunk}</span>;
                const key = `${i}-${chunk}`;
                const isSpeaking = speakingWord === key;
                return (
                  <Box
                    key={key}
                    component="button"
                    type="button"
                    onClick={() => handleWordClick(chunk, key)}
                    data-testid={`story-word-${i}`}
                    sx={{
                      display: "inline",
                      p: "2px 4px",
                      m: 0,
                      border: "none",
                      bgcolor: isSpeaking ? "warning.light" : "transparent",
                      borderRadius: 1,
                      cursor: "pointer",
                      font: "inherit",
                      fontWeight: isSpeaking ? 800 : 600,
                      color: isSpeaking ? "secondary.dark" : "text.primary",
                      minHeight: 36,
                      minWidth: 4,
                      verticalAlign: "baseline",
                      transition: "background-color 0.15s ease",
                      "&:hover": { bgcolor: "action.hover" },
                      "&:active": { bgcolor: "warning.light" },
                    }}
                  >
                    {chunk}
                  </Box>
                );
              })}
            </Typography>
            <Alert severity="info" sx={{ mt: 2, fontWeight: 700 }}>
              Tip: tap any word to hear it.
            </Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box data-testid="stories-tab">
      <Typography variant="h5" gutterBottom color="text.primary">
        Stories
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Choose a story, then tap words to hear them.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        {stories.map((s) => {
          const done = read.includes(s.id);
          return (
            <Card
              key={s.id}
              variant="outlined"
              sx={{ borderRadius: 3, borderWidth: 2 }}
              data-testid={`story-${s.id}`}
            >
              <CardActionArea onClick={() => openStory(s)} sx={{ alignItems: "stretch" }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    p: 2,
                    bgcolor: "warning.light",
                    borderBottom: 2,
                    borderColor: "divider",
                  }}
                >
                  <Typography sx={{ fontSize: "3rem", lineHeight: 1 }}>{s.emoji || "📖"}</Typography>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" noWrap sx={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>
                      {s.title}
                    </Typography>
                    {done && (
                      <Chip label="Read" size="small" color="success" sx={{ mt: 1, fontWeight: 700 }} />
                    )}
                  </Box>
                </Box>
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      fontWeight: 600,
                    }}
                  >
                    {s.content.slice(0, 140)}…
                  </Typography>
                  <Stack sx={{ flexDirection: "row", alignItems: "center", gap: 1, mt: 1.5, color: "primary.main" }}>
                    <AutoStoriesIcon />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Start reading
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
