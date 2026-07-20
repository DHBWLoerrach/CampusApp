import {
  normalizeCanteenData,
  mealsForDate,
  summarizeAllergensAndLabels,
  type CanteenDay,
} from '@/lib/canteenService';

describe('summarizeAllergensAndLabels', () => {
  it('lists allergens that are present', () => {
    const summary = summarizeAllergensAndLabels('', 'Gluten, Milch, Ei');
    expect(summary).toBe('Gluten, Milch, Ei');
  });

  it('does not list an allergen marked as "-frei"', () => {
    const summary = summarizeAllergensAndLabels('glutenfrei', '');
    expect(summary).toBeUndefined();
  });

  it('still lists other allergens when one is marked "-frei"', () => {
    // A gluten-free dish can still contain milk and egg.
    const summary = summarizeAllergensAndLabels('glutenfrei', 'Milch, Ei');
    expect(summary).toBe('Milch, Ei');
  });

  it('lists milk for a lactose-free dish that still contains milk', () => {
    const summary = summarizeAllergensAndLabels('laktosefrei', 'Milch');
    expect(summary).toBe('Milch');
  });

  it('surfaces alcohol as an extra notice', () => {
    const summary = summarizeAllergensAndLabels('Alkohol', '');
    expect(summary).toBe('Alkohol');
  });

  it('returns undefined when nothing relevant is found', () => {
    expect(summarizeAllergensAndLabels('', '')).toBeUndefined();
  });
});

describe('normalizeCanteenData', () => {
  it('parses valid XML into days and meals with prices', () => {
    const xml = [
      '<plan>',
      '  <ort id="677">',
      '    <tagesplan datum="2025-06-23">',
      '      <menue>',
      '        <name>Spaghetti Bolognese</name>',
      '        <art>Hauptgericht</art>',
      '        <preis>',
      '          <studierende>3,50</studierende>',
      '          <angestellte>5,00</angestellte>',
      '        </preis>',
      '      </menue>',
      '    </tagesplan>',
      '  </ort>',
      '</plan>',
    ].join('\n');

    const days = normalizeCanteenData(xml);
    expect(days).toHaveLength(1);
    expect(days[0].date).toBe('2025-06-23');
    expect(days[0].meals).toHaveLength(1);
    expect(days[0].meals[0].title).toBe('Spaghetti Bolognese');
    expect(days[0].meals[0].prices).toEqual({
      Studierende: '3,50',
      Angestellte: '5,00',
    });
  });

  it('returns an empty array for empty string input', () => {
    expect(normalizeCanteenData('')).toEqual([]);
  });

  it('returns an empty array when the structure is missing', () => {
    expect(normalizeCanteenData('<other></other>')).toEqual([]);
  });

  it('produces no meal for a menue without a name', () => {
    const xml = [
      '<plan>',
      '  <ort id="677">',
      '    <tagesplan datum="2025-06-23">',
      '      <menue>',
      '        <art>Hauptgericht</art>',
      '      </menue>',
      '    </tagesplan>',
      '  </ort>',
      '</plan>',
    ].join('\n');

    const days = normalizeCanteenData(xml);
    expect(days).toHaveLength(1);
    expect(days[0].meals).toEqual([]);
  });
});

describe('mealsForDate', () => {
  const meal = { title: 'Spaghetti Bolognese' };

  it('returns meals on an exact ISO date match', () => {
    const days: CanteenDay[] = [{ date: '2025-06-23', meals: [meal] }];
    expect(mealsForDate(days, new Date(2025, 5, 23))).toEqual([meal]);
  });

  it('matches a German-formatted date', () => {
    const days: CanteenDay[] = [{ date: '23.06.2025', meals: [meal] }];
    expect(mealsForDate(days, new Date(2025, 5, 23))).toEqual([meal]);
  });

  it('returns an empty array when no day matches', () => {
    const days: CanteenDay[] = [{ date: '2025-06-23', meals: [meal] }];
    expect(mealsForDate(days, new Date(2025, 5, 24))).toEqual([]);
  });
});
