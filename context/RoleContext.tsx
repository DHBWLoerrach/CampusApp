import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import Storage from "expo-sqlite/kv-store";
import type { Role } from "@/constants/Roles";

const ROLE_KEY = "userRole";
const TERMS_KEY = "acceptedTerms";

// Role Context for sharing user role across the app

interface RoleContextType {
  selectedRole: Role | null;
  setSelectedRole: (role: Role | null) => Promise<void>;
  acceptedTerms: boolean;
  setAcceptedTerms: (accepted: boolean) => Promise<void>;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function useRoleContext() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error("useRoleContext must be used within a RoleProvider");
  }
  return ctx;
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [selectedRole, setSelectedRoleState] = useState<Role | null>(null);
  const [acceptedTerms, setAcceptedTermsState] = useState<boolean>(false);
  const [roleReady, setRoleReady] = useState(false);
  const [termsReady, setTermsReady] = useState(false);
  const isLoading = !(roleReady && termsReady);

  useEffect(() => {
    (async () => {
      try {
        const raw = await Storage.getItem(ROLE_KEY);
        if (raw) {
          setSelectedRoleState(raw as Role);
        }
      } catch (e) {
        // Ignore storage errors and start without role
      } finally {
        setRoleReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const raw = await Storage.getItem(TERMS_KEY);
        if (raw != null) {
          setAcceptedTermsState(raw === "1");
        }
      } catch (e) {
        // Ignore storage errors and use default false
      } finally {
        setTermsReady(true);
      }
    })();
  }, []);

  const setSelectedRole = async (role: Role | null) => {
    setSelectedRoleState(role);
    try {
      if (role) {
        await Storage.setItem(ROLE_KEY, role);
      } else {
        await Storage.removeItem(ROLE_KEY);
      }
    } catch (e) {
      // Ignore persistence errors
    }
  };

  const setAcceptedTerms = async (accepted: boolean) => {
    setAcceptedTermsState(accepted);
    try {
      if (accepted) {
        await Storage.setItem(TERMS_KEY, "1");
      } else {
        await Storage.removeItem(TERMS_KEY);
      }
    } catch (e) {
      // Ignore persistence errors
    }
  };

  return (
    <RoleContext.Provider
      value={{
        selectedRole,
        setSelectedRole,
        acceptedTerms,
        setAcceptedTerms,
        isLoading,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export { RoleContext };
