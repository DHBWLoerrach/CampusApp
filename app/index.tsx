import { Redirect } from 'expo-router';
import { useRoleContext } from '@/context/RoleContext';

export default function Page() {
  const { selectedRole, acceptedTerms, isLoading } = useRoleContext();
  if (isLoading) return null;
  return (
    <Redirect
      href={
        selectedRole && acceptedTerms ? '/(tabs)/news' : '/welcome'
      }
    />
  );
}
