# Offline UX Plan

## Goals

- Consistent offline handling for all network requests (TanStack Query).
- Clear UX for offline with and without cached data.
- No persistent cache after app restart (out of scope for now).

## Completed

- [x] Add NetInfo dependency and `useOnlineStatus` hook.
- [x] Create `OfflineBanner` and `OfflineEmptyState` UI components.
- [x] Apply offline UX to RSS (Aktuelles/Termine), auto-refresh on reconnect.
- [x] Move RSS fetching to TanStack Query.
- [x] Add component test for `RSSFeedList`.
- [x] Run full lint and test suite.
- [x] Roll out offline UX to Schedule (list + CourseSetup).
- [x] Roll out offline UX to Canteen.
- [x] Roll out offline UX to Rides.

## Next Steps

- [ ] After rollout, wire React Query `onlineManager` globally.
- [ ] Optional: distinguish "offline" vs "invalid course" in course validation.

## Design Decisions

- Offline banner is **sticky** (does not scroll with content) for better visibility.
- Offline banner uses **static text** (`'Inhalte können nicht aktualisiert werden.'`) — no timestamps.
- `CourseSetup` has a **specific message** since it blocks validation, not cached data display.

## Standardized Screen Behavior

- offline + cached data -> show data + `OfflineBanner`
- offline + empty -> show `OfflineEmptyState`
- online + error -> error state with retry

## Open Questions

- Should "Retry" be disabled while offline or show a short toast?

## Testing Checklist

- Flight mode on, no cached items -> offline empty state.
- Flight mode on, cached items -> banner + items remain visible.
- Flight mode off -> auto-refresh once reconnected.
- Pull-to-refresh while online.
