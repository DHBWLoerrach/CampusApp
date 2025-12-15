import { getLocationMeta } from '@/lib/utils';

describe('getLocationMeta', () => {
  it('extracts hint from "begleitetes Selbststudium, online"', () => {
    const meta = getLocationMeta('begleitetes Selbststudium, online');
    expect(meta.isOnline).toBe(true);
    expect(meta.url).toBeNull();
    expect(meta.hint).toBe('begleitetes Selbststudium');
  });

  it('treats "online" as online without hint', () => {
    const meta = getLocationMeta('online');
    expect(meta.isOnline).toBe(true);
    expect(meta.url).toBeNull();
    expect(meta.hint).toBeNull();
  });

  it('extracts first URL as online link', () => {
    const meta = getLocationMeta('Online: https://bbb.dhbw.de/meeting');
    expect(meta.isOnline).toBe(true);
    expect(meta.url).toBe('https://bbb.dhbw.de/meeting');
    expect(meta.hint).toBeNull();
  });

  it('keeps non-online locations as room text', () => {
    const meta = getLocationMeta('Hörsaal A');
    expect(meta.isOnline).toBe(false);
    expect(meta.url).toBeNull();
    expect(meta.room).toBe('Hörsaal A');
    expect(meta.hint).toBeNull();
  });

  it('extracts hint when online is implied by URL', () => {
    const meta = getLocationMeta(
      'begleitetes Selbststudium https://bbb.dhbw.de/meeting'
    );
    expect(meta.isOnline).toBe(true);
    expect(meta.url).toBe('https://bbb.dhbw.de/meeting');
    expect(meta.hint).toBe('begleitetes Selbststudium');
  });
});

