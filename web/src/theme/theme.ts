import { alpha, createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5B4FFF",
      light: "#8B7CFF",
      dark: "#3A2FD4",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#FF5C8D",
      light: "#FF8FB3",
      dark: "#D63D6F",
      contrastText: "#FFFFFF",
    },
    success: { main: "#10B981" },
    warning: { main: "#F59E0B" },
    info: { main: "#06B6D4" },
    error: { main: "#EF4444" },
    background: {
      default: "#E8E5FF",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E1B4B",
      secondary: "#4C4894",
    },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: ['var(--font-body)', "Nunito", "system-ui", "sans-serif"].join(","),
    h4: {
      fontFamily: ['var(--font-display)', "Baloo 2", "cursive", "sans-serif"].join(","),
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontFamily: ['var(--font-display)', "Baloo 2", "cursive", "sans-serif"].join(","),
      fontWeight: 800,
    },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600, lineHeight: 1.4 },
    body1: { lineHeight: 1.55 },
    body2: { lineHeight: 1.5 },
    button: { textTransform: "none", fontWeight: 700, letterSpacing: "0.02em" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitTapHighlightColor: "transparent",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          minHeight: 48,
          paddingInline: 22,
        },
        sizeLarge: { minHeight: 52, fontSize: "1.05rem", paddingInline: 26 },
        sizeSmall: { minHeight: 40, paddingInline: 16 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: `0 10px 40px ${alpha("#312E81", 0.12)}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 20 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage:
            "linear-gradient(120deg, #4F46E5 0%, #7C3AED 40%, #C026D3 100%)",
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 64,
          maxWidth: "none",
          paddingTop: 8,
          paddingBottom: 8,
        },
        label: {
          fontSize: "0.7rem",
          fontWeight: 700,
          "&.Mui-selected": { fontSize: "0.72rem" },
        },
      },
    },
  },
});
