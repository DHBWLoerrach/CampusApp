import { render } from '@testing-library/react-native';
import TopTabLabel from '@/components/ui/TopTabLabel';

describe('TopTabLabel', () => {
  it('renders children text', () => {
    const { getByText } = render(
      <TopTabLabel focused={false}>News</TopTabLabel>
    );
    expect(getByText('News')).toBeTruthy();
  });

  it('renders numeric children', () => {
    const { getByText } = render(
      <TopTabLabel focused={true}>{42}</TopTabLabel>
    );
    expect(getByText('42')).toBeTruthy();
  });

  it('applies full opacity when focused', () => {
    const { getByText } = render(<TopTabLabel focused={true}>Tab</TopTabLabel>);
    expect(getByText('Tab').props.style.opacity).toBe(1);
  });

  it('applies reduced opacity when not focused', () => {
    const { getByText } = render(
      <TopTabLabel focused={false}>Tab</TopTabLabel>
    );
    expect(getByText('Tab').props.style.opacity).toBe(0.7);
  });

  it('uses custom color when provided', () => {
    const { getByText } = render(
      <TopTabLabel focused={true} color="red">
        Tab
      </TopTabLabel>
    );
    expect(getByText('Tab').props.style.color).toBe('red');
  });

  it('defaults to white color', () => {
    const { getByText } = render(<TopTabLabel focused={true}>Tab</TopTabLabel>);
    expect(getByText('Tab').props.style.color).toBe('white');
  });
});
