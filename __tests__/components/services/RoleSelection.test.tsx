import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import RoleSelection from '@/components/services/RoleSelection';
import type { Role } from '@/constants/Roles';

jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#000000',
}));

function StatefulRoleSelection({ initial }: { initial: Role | null }) {
  const [role, setRole] = useState<Role | null>(initial);
  return <RoleSelection role={role} onRoleChange={setRole} />;
}

describe('RoleSelection', () => {
  it('exposes the options as a labelled radio group', async () => {
    await render(<StatefulRoleSelection initial={null} />);

    expect(screen.getByLabelText('Mensa-Preisgruppe')).toHaveProp(
      'accessibilityRole',
      'radiogroup'
    );
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.queryByRole('radio', { checked: true })).toBeNull();
  });

  it('marks only the selected role as checked', async () => {
    await render(<StatefulRoleSelection initial="Gast" />);

    expect(
      screen.getByRole('radio', { name: 'Gast', checked: true })
    ).toBeTruthy();
    expect(screen.getAllByRole('radio', { checked: false })).toHaveLength(3);
  });

  it('moves the checked state when another role is pressed', async () => {
    await render(<StatefulRoleSelection initial="Gast" />);

    await fireEvent.press(screen.getByRole('radio', { name: 'Studierende' }));

    expect(
      screen.getByRole('radio', { name: 'Studierende', checked: true })
    ).toBeTruthy();
    expect(
      screen.getByRole('radio', { name: 'Gast', checked: false })
    ).toBeTruthy();
  });
});
