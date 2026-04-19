"use client";

import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import Zoom from "@mui/material/Zoom";

export function PowBurst({ show, text = "Nice!" }: { show: boolean; text?: string }) {
  return (
    <Dialog
      open={show}
      slots={{ transition: Zoom }}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "visible",
            pointerEvents: "none",
          },
        },
        backdrop: { invisible: true },
      }}
      data-testid="pow-burst"
    >
      <Typography
        variant="h3"
        align="center"
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: { xs: "2.75rem", sm: "4rem" },
          color: "warning.main",
          textShadow: (theme) =>
            `0 2px 0 ${theme.palette.primary.dark}, 0 4px 12px ${theme.palette.secondary.light}`,
        }}
      >
        {text}
      </Typography>
    </Dialog>
  );
}
