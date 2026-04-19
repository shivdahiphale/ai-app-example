"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import { speak } from "@/lib/tts";
import type { Word } from "@/types/content";

type Props = {
  words: Word[];
  loading: boolean;
  learned: string[];
  recordProgress: (type: "word", itemId: string) => void;
};

export function WordsTab({ words, loading, learned, recordProgress }: Props) {
  const playWord = async (w: Word) => {
    await speak(w.word);
    if (!learned.includes(w.id)) {
      recordProgress("word", w.id);
    }
  };

  const playWithMeaning = async (w: Word) => {
    await speak(`${w.word}. ${w.meaning}.`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
        <CircularProgress size={48} color="primary" />
      </Box>
    );
  }

  return (
    <Box data-testid="words-tab">
      <Typography variant="h5" gutterBottom color="text.primary">
        Word practice
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Tap the card or buttons to hear the word and its meaning.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        {words.map((w) => {
          const done = learned.includes(w.id);
          return (
            <Card
              key={w.id}
              variant="outlined"
              sx={{
                position: "relative",
                borderRadius: 3,
                borderWidth: 2,
                overflow: "visible",
              }}
              data-testid={`word-card-${w.word}`}
            >
              {done && (
                <Chip
                  icon={<StarIcon sx={{ fontSize: "18px !important" }} />}
                  label="Learned"
                  size="small"
                  color="warning"
                  sx={{ position: "absolute", top: 12, right: 12, zIndex: 1, fontWeight: 700 }}
                />
              )}
              <Box
                component="button"
                type="button"
                onClick={() => playWord(w)}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  cursor: "pointer",
                  p: 2.5,
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                  "&:active": { opacity: 0.92 },
                }}
              >
                <Typography sx={{ fontSize: "3.5rem", lineHeight: 1 }}>{w.emoji}</Typography>
                <Typography variant="h4" fontFamily="var(--font-display)" fontWeight={800}>
                  {w.word}
                </Typography>
                {w.category && (
                  <Chip
                    label={w.category}
                    size="small"
                    sx={{ mt: 1, fontWeight: 700, bgcolor: "rgba(255,255,255,0.25)", color: "inherit" }}
                  />
                )}
              </Box>
              <CardContent sx={{ pt: 2 }}>
                <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ minHeight: 48 }}>
                  {w.meaning}
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    startIcon={<VolumeUpIcon />}
                    onClick={() => playWord(w)}
                    data-testid={`speak-word-${w.word}`}
                  >
                    Say it
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<SchoolIcon />}
                    onClick={() => playWithMeaning(w)}
                  >
                    Meaning
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
