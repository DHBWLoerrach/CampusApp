# DHBW Lörrach CampusApp - AI Agent Instructions

## Project Overview

This is the official campus app for DHBW Lörrach (Duale Hochschule Baden-Württemberg), built with React Native and Expo. The app provides students with access to news, schedules, canteen menus, and campus services.

## Architecture Patterns

### Theme & Color System

- **ColorSchemeContext**: Centralized theme management with automatic/manual dark mode switching
- **DHBW Brand Colors**: Use `dhbwRed` (#E2001A) as primary brand color
- **Theming Pattern**: All components use `ColorSchemeContext` for dynamic styling (dark/light mode)

```js
const colorContext = useContext(ColorSchemeContext);
// Apply theme: colorContext.colorScheme.background, .text, .dhbwRed
```

### Data Flow & Storage

- **AsyncStorage**: Local persistence for user preferences, course data, cached content

### Navigation Patterns

- Expo Router with file-based routing
- Tab structure: `(tabs)/_layout.tsx` defines main tabs
- Route params passed via navigation.navigate() or URL params

### Component Architecture

- **UI Components**: Reusable components in `components/ui/` (e.g. IconSymbol)
- **Feature Components**: Screen-specific components in feature directories
- **Styled Components**: Use StyleSheet.create() with dynamic theming

### Service Integration

- **RSS Feeds**: News and events from DHBW feeds
- **iCal Parsing**: Course schedules from iCal endpoints
- **NFC**: Campus card balance reading (iOS/Android specific implementations)
- **WebView**: Embedded content (360° tour, PDFs, external sites)

## Key Files & Directories

- `app/_layout.tsx`: Expo Router root layout
- `constants/Colors.ts`: Theme color definitions
- `components/ui/`: Reusable themed UI components
- `lib/`: Utility services (iCal parsing, RSS parsing, NFC helpers)

## Development Conventions

- **Platform Handling**: Use Platform.OS for iOS/Android differences (for example, NFC)
- **Error Boundaries**: Graceful degradation with ReloadView components
- **Accessibility**: Proper labeling and touch targets for campus service features
- **German Localization**: UI text in German (this is a German university app)

## Service-Specific Logic

- **Course Selection**: Required for schedule access, stored persistently
- **Role-Based Pricing**: Canteen prices vary by user role (student/staff/guest)
