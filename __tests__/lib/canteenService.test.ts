import { summarizeAllergensAndLabels } from '@/lib/canteenService';

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
