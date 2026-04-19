"use client";

import { useEffect, useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import AbcIcon from "@mui/icons-material/Abc";
import StarsIcon from "@mui/icons-material/Stars";
import ShieldIcon from "@mui/icons-material/Shield";
import { PhonicsTab } from "@/components/PhonicsTab";
import { WordsTab } from "@/components/WordsTab";
import { StoriesTab } from "@/components/StoriesTab";
import { useProgress } from "@/hooks/useProgress";
import type { Phonic, Story, Word } from "@/types/content";

type TabId = "phonics" | "words" | "stories";

const TABS: { id: TabId; label: string; short: string; icon: typeof GraphicEqIcon }[] = [
  { id: "phonics", label: "Phonics", short: "Sounds", icon: GraphicEqIcon },
  { id: "words", label: "Words", short: "Words", icon: AbcIcon },
  { id: "stories", label: "Stories", short: "Stories", icon: AutoStoriesIcon },
];

function StatCard({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 0,
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
      data-testid={`stat-${label.toLowerCase()}`}
    >
      <CardContent sx={{ py: 1.5, px: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="caption" fontWeight={800} sx={{ color }} noWrap>
            {label}
          </Typography>
          <Typography variant="caption" fontWeight={800} color="text.primary">
            {value}/{total}
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percent}
          sx={{
            mt: 1,
            height: 8,
            borderRadius: 99,
            bgcolor: "action.hover",
            "& .MuiLinearProgress-bar": { borderRadius: 99, bgcolor: color },
          }}
        />
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [tab, setTab] = useState<TabId>("phonics");
  const [phonics, setPhonics] = useState<Phonic[]>([]);
  const [words, setWords] = useState<Word[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { progress, recordProgress, hydrated } = useProgress();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, w, s] = await Promise.all([
          fetch("/data/phonics.json").then((r) => r.json()),
          fetch("/data/words.json").then((r) => r.json()),
          fetch("/data/stories.json").then((r) => r.json()),
        ]);
        if (!cancelled) {
          setPhonics(p);
          setWords(w);
          setStories(s);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loading = dataLoading || !hydrated;

  return (
    <Box
      data-testid="dashboard"
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        pb: isMobile ? 10 : 0,
      }}
    >
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar sx={{ gap: 2, py: 1, minHeight: { xs: 56, sm: 64 } }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldIcon sx={{ fontSize: 28, color: "common.white" }} />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" component="div" color="inherit" fontFamily="var(--font-display)" noWrap>
              Hero Phonics
            </Typography>
            <Typography variant="caption" color="inherit" sx={{ opacity: 0.9 }} noWrap>
              Learn &amp; play
            </Typography>
          </Box>
          <Chip
            icon={<StarsIcon sx={{ color: "warning.main !important" }} />}
            label={progress.stars}
            data-testid="stars-counter"
            sx={{
              fontWeight: 800,
              fontSize: "1rem",
              height: 40,
              px: 0.5,
              bgcolor: "rgba(255,255,255,0.95)",
              color: "primary.dark",
              "& .MuiChip-icon": { fontSize: 22 },
            }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <StatCard
            label="Phonics"
            value={progress.phonics_learned.length}
            total={phonics.length || 26}
            color={theme.palette.primary.main}
          />
          <StatCard
            label="Words"
            value={progress.words_learned.length}
            total={words.length || 16}
            color={theme.palette.secondary.main}
          />
          <StatCard
            label="Stories"
            value={progress.stories_read.length}
            total={stories.length || 4}
            color={theme.palette.success.main}
          />
        </Stack>

        {!isMobile && (
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
              overflow: "hidden",
            }}
            data-testid="tabs-nav"
          >
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v as TabId)}
              variant="fullWidth"
              sx={{
                "& .MuiTab-root": { minHeight: 56, fontWeight: 700 },
              }}
            >
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <Tab
                    key={t.id}
                    value={t.id}
                    label={t.label}
                    icon={<Icon />}
                    iconPosition="start"
                    data-testid={`tab-${t.id}`}
                  />
                );
              })}
            </Tabs>
          </Paper>
        )}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            minHeight: { xs: 360, sm: 420 },
          }}
        >
          {tab === "phonics" && (
            <PhonicsTab
              phonics={phonics}
              loading={loading}
              learned={progress.phonics_learned}
              recordProgress={(type, id) => recordProgress(type, id)}
            />
          )}
          {tab === "words" && (
            <WordsTab
              words={words}
              loading={loading}
              learned={progress.words_learned}
              recordProgress={(type, id) => recordProgress(type, id)}
            />
          )}
          {tab === "stories" && (
            <StoriesTab
              stories={stories}
              loading={loading}
              read={progress.stories_read}
              recordProgress={(type, id) => recordProgress(type, id)}
            />
          )}
        </Paper>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3, mb: isMobile ? 2 : 0 }}>
          Made for little heroes — Hero Phonics
        </Typography>
      </Container>

      {isMobile && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            borderTop: 1,
            borderColor: "divider",
            borderRadius: 0,
          }}
          elevation={8}
        >
          <BottomNavigation
            value={tab}
            onChange={(_, newValue) => setTab(newValue as TabId)}
            showLabels
            data-testid="tabs-nav"
          >
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <BottomNavigationAction
                  key={t.id}
                  value={t.id}
                  label={t.short}
                  icon={<Icon />}
                  data-testid={`tab-${t.id}`}
                />
              );
            })}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
