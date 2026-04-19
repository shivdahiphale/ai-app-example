"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import StarIcon from "@mui/icons-material/Star";
import { speak } from "@/lib/tts";
import { PowBurst } from "@/components/PowBurst";
import type { Phonic } from "@/types/content";

type Props = {
  phonics: Phonic[];
  loading: boolean;
  learned: string[];
  recordProgress: (type: "phonic", itemId: string) => void;
};

export function PhonicsTab({ phonics, loading, learned, recordProgress }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showPow, setShowPow] = useState(false);

  const playPhonic = async (p: Phonic) => {
    setSelected(p.id);
    const text = `${p.letter}. ${p.sound}. ${p.example_word}.`;
    await speak(text, undefined, () => {
      setShowPow(true);
      setTimeout(() => setShowPow(false), 800);
    });
    if (!learned.includes(p.id)) {
      recordProgress("phonic", p.id);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 240 }}>
        <CircularProgress size={48} color="primary" />
      </Box>
    );
  }

  const selectedPhonic = phonics.find((p) => p.id === selected);

  return (
    <Box data-testid="phonics-tab">
      <PowBurst show={showPow} text="Great!" />

      <Typography variant="h5" gutterBottom color="text.primary">
        Phonic sounds
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Tap a letter to hear it. Big buttons are easy for small fingers.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(4, minmax(0, 1fr))",
            sm: "repeat(6, minmax(0, 1fr))",
            md: "repeat(7, minmax(0, 1fr))",
          },
          gap: { xs: 1.25, sm: 1.5 },
        }}
      >
        {phonics.map((p) => {
          const done = learned.includes(p.id);
          return (
            <Card
              key={p.id}
              variant="outlined"
              sx={{
                position: "relative",
                borderRadius: 2.5,
                borderWidth: 2,
                borderColor: selected === p.id ? "primary.main" : "divider",
                bgcolor: done ? "warning.light" : "background.paper",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:active": { transform: "scale(0.97)" },
              }}
            >
              <CardActionArea
                onClick={() => playPhonic(p)}
                data-testid={`phonic-${p.letter}`}
                sx={{
                  minHeight: { xs: 88, sm: 96 },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 1,
                  px: 0.5,
                }}
              >
                {done && (
                  <StarIcon
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      fontSize: 20,
                      color: "warning.dark",
                    }}
                  />
                )}
                <Typography
                  variant="h3"
                  component="span"
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    color: p.color,
                    lineHeight: 1,
                  }}
                >
                  {p.letter}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                  noWrap
                  sx={{ mt: 0.5, fontWeight: 700, lineHeight: 1.2, px: 0.5, width: "100%" }}
                >
                  {p.example_word}
                </Typography>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {selectedPhonic && (
        <Card variant="outlined" sx={{ mt: 3, borderRadius: 3, borderWidth: 2 }} data-testid="phonic-detail">
          <CardContent>
            <Stack sx={{ flexDirection: { xs: "column", sm: "row" }, gap: 2, alignItems: { sm: "center" } }}>
              <Box
                sx={{
                  width: { xs: "100%", sm: 100 },
                  height: 100,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "background.default",
                  border: 2,
                  borderColor: "divider",
                  alignSelf: { xs: "center", sm: "flex-start" },
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    color: selectedPhonic.color,
                  }}
                >
                  {selectedPhonic.letter}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontFamily: "var(--font-display)", fontWeight: 800 }}
                >
                  {selectedPhonic.example_word}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Letter <strong>{selectedPhonic.letter}</strong>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sounds like:{" "}
                  <Box component="span" sx={{ fontWeight: 800, color: "secondary.main" }}>
                    &quot;{selectedPhonic.sound}&quot;
                  </Box>
                </Typography>
              </Box>
            </Stack>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<VolumeUpIcon />}
              onClick={() => playPhonic(selectedPhonic)}
              data-testid="phonic-play-again"
            >
              Hear again
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
