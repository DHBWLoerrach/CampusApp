import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';
import CanteenDayView from '@/components/canteen/CanteenDayView';
import { roles, type Role } from '@/constants/Roles';
import { RoleProvider, useRoleContext } from '@/context/RoleContext';
import { describeClosure, type ClosureInfo } from '@/lib/canteenClosures';
import { normalizeCanteenData } from '@/lib/canteenService';

// Network and native boundaries are mocked; parsing, price selection and the
// role context run for real.
const mockFetchCanteenRaw = jest.fn();
const mockGetCanteenClosure = jest.fn();
let mockOnlineStatus = { isOnline: true, isOffline: false, isReady: true };
const mockStore = new Map<string, string>();

jest.mock('@/lib/canteenService', () => ({
  ...jest.requireActual('@/lib/canteenService'),
  fetchCanteenRaw: (...args: unknown[]) => mockFetchCanteenRaw(...args),
}));

jest.mock('@/lib/canteenClosures', () => ({
  ...jest.requireActual('@/lib/canteenClosures'),
  getCanteenClosure: (...args: unknown[]) => mockGetCanteenClosure(...args),
}));

jest.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => mockOnlineStatus,
}));

jest.mock('expo-sqlite/kv-store', () => ({
  getItem: async (key: string) => mockStore.get(key) ?? null,
  setItem: async (key: string, value: string) => {
    mockStore.set(key, value);
  },
  removeItem: async (key: string) => {
    mockStore.delete(key);
  },
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#000000',
}));

jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

jest.mock('@/components/canteen/NfcButton', () => ({
  __esModule: true,
  default: () => null,
}));

const DAY = new Date(2026, 10, 3); // Tuesday, 3 November 2026

// Mirrors the structure of the production SWFR feed
const MENU_XML = [
  '<plan>',
  '  <ort id="677">',
  '    <tagesplan datum="03.11.2026">',
  '      <menue art="Essen 1" zusatz="vegan">',
  '        <name>Linsencurry mit Reis</name>',
  '        <nameMitUmbruch>Linsencurry&lt;br&gt;mit Reis</nameMitUmbruch>',
  '        <kennzeichnungen>Alkohol</kennzeichnungen>',
  '        <allergene>Se: Sellerie,Sf: Senf</allergene>',
  '        <preis>',
  '          <studierende>3,50€</studierende>',
  '          <angestellte>5,00€</angestellte>',
  '          <gaeste>6,20€</gaeste>',
  '          <schueler>3,50€</schueler>',
  '        </preis>',
  '      </menue>',
  '    </tagesplan>',
  '  </ort>',
  '</plan>',
].join('\n');

function RoleSwitcher() {
  const { setSelectedRole } = useRoleContext();
  return (
    <>
      {roles.map((role) => (
        <Pressable key={role} onPress={() => void setSelectedRole(role)}>
          <Text>{`Rolle ${role}`}</Text>
        </Pressable>
      ))}
    </>
  );
}

function renderView({
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  }),
  date = DAY,
}: { queryClient?: QueryClient; date?: Date } = {}) {
  return render(
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <RoleSwitcher />
        <CanteenDayView date={date} />
      </RoleProvider>
    </QueryClientProvider>
  );
}

describe('CanteenDayView', () => {
  beforeEach(() => {
    mockStore.clear();
    mockOnlineStatus = { isOnline: true, isOffline: false, isReady: true };
    mockFetchCanteenRaw.mockReset().mockResolvedValue(MENU_XML);
    mockGetCanteenClosure.mockReset().mockReturnValue(null);
  });

  it('shows the guest price when no role is selected', async () => {
    await renderView();

    expect(await screen.findByText('Linsencurry · mit Reis')).toBeTruthy();
    expect(screen.getByLabelText('Preis: 6,20 €')).toBeTruthy();
  });

  it.each<[Role, string]>([
    ['Studierende', '3,50 €'],
    ['Mitarbeitende', '5,00 €'],
    ['Lehrbeauftragte', '6,20 €'],
    ['Gast', '6,20 €'],
  ])('shows the price for %s', async (role, price) => {
    mockStore.set('userRole', role);

    await renderView();

    expect(await screen.findByLabelText(`Preis: ${price}`)).toBeTruthy();
  });

  it('updates the visible price when the role changes', async () => {
    mockStore.set('userRole', 'Gast');
    await renderView();
    expect(await screen.findByLabelText('Preis: 6,20 €')).toBeTruthy();

    await fireEvent.press(screen.getByText('Rolle Studierende'));

    expect(await screen.findByLabelText('Preis: 3,50 €')).toBeTruthy();
    expect(screen.queryByLabelText('Preis: 6,20 €')).toBeNull();
  });

  it('expands and collapses allergens and labels', async () => {
    await renderView();
    const toggle = await screen.findByRole('button', {
      name: 'Allergene und Zusätze anzeigen',
    });
    expect(screen.queryByText('Alkohol · Se: Sellerie,Sf: Senf')).toBeNull();

    await fireEvent.press(toggle);

    expect(screen.getByText('Alkohol · Se: Sellerie,Sf: Senf')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Allergene und Zusätze ausblenden' })
    );
    expect(screen.queryByText('Alkohol · Se: Sellerie,Sf: Senf')).toBeNull();
  });

  it('shows a loading state while the menu is fetched', async () => {
    mockFetchCanteenRaw.mockReturnValue(new Promise(() => {}));

    await renderView();

    expect(screen.getByText('Lade Speiseplan …')).toBeTruthy();
  });

  it('shows the error and recovers after a retry', async () => {
    mockFetchCanteenRaw.mockRejectedValueOnce(
      new Error('SWFR API Fehler: 503 Service Unavailable')
    );

    await renderView();

    expect(
      await screen.findByText('Fehler beim Laden des Speiseplans')
    ).toBeTruthy();
    expect(
      screen.getByText('SWFR API Fehler: 503 Service Unavailable')
    ).toBeTruthy();

    await fireEvent.press(screen.getByText('Erneut versuchen'));

    expect(await screen.findByText('Linsencurry · mit Reis')).toBeTruthy();
  });

  it('shows the offline state when there is no menu yet', async () => {
    mockOnlineStatus = { isOnline: false, isOffline: true, isReady: true };
    mockFetchCanteenRaw.mockRejectedValue(new Error('Network request failed'));

    await renderView();

    expect(
      await screen.findByText(
        'Der Speiseplan kann ohne Internetverbindung nicht geladen werden.'
      )
    ).toBeTruthy();
  });

  it('keeps showing the cached menu with a banner when offline', async () => {
    mockOnlineStatus = { isOnline: false, isOffline: true, isReady: true };
    mockFetchCanteenRaw.mockRejectedValue(new Error('Network request failed'));
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    queryClient.setQueryData(['canteen-swfr'], {
      days: normalizeCanteenData(MENU_XML),
    });

    await renderView({ queryClient });

    expect(await screen.findByText('Linsencurry · mit Reis')).toBeTruthy();
    expect(
      screen.getByLabelText(
        'Offline. Inhalte können nicht aktualisiert werden.'
      )
    ).toBeTruthy();
  });

  it('shows a closure instead of the menu', async () => {
    const closure: ClosureInfo = describeClosure({
      from: '2026-11-02',
      through: '2026-11-06',
      title: 'Umbau',
      scope: 'building',
    });
    mockGetCanteenClosure.mockReturnValue(closure);

    await renderView();

    expect(await screen.findByText('Mensa geschlossen')).toBeTruthy();
    expect(screen.getByText('Umbau bis 6. November')).toBeTruthy();
    expect(screen.queryByText('Linsencurry · mit Reis')).toBeNull();
  });

  it('shows a hint for a day without menu', async () => {
    await renderView({ date: new Date(2026, 10, 4) });

    expect(await screen.findByText('Kein Speiseplan gefunden.')).toBeTruthy();
  });
});
