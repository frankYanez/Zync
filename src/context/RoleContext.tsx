import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { clearPersistedRole, loadPersistedRole, persistRole, UserRole } from './role-storage';

export type { UserRole };
export { clearPersistedRole };

interface RoleContextType {
    currentRole: UserRole;
    isLoading: boolean;
    switchRole: (role: UserRole) => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};

function isRoleAllowed(role: UserRole, backendRoles: string[]): boolean {
    if (role === 'business') return backendRoles.includes('ORGANIZER');
    if (role === 'dj') return backendRoles.includes('DJ');
    return true; // 'user' is always allowed
}

interface RoleProviderProps {
    children: ReactNode;
    userRoles: string[];
    authLoading: boolean;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children, userRoles, authLoading }) => {
    const [currentRole, setCurrentRole] = useState<UserRole>('user');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        loadPersistedRole().then(async saved => {
            if (saved && isRoleAllowed(saved, userRoles)) {
                setCurrentRole(saved);
            } else {
                await clearPersistedRole();
                setCurrentRole('user');
            }
            setIsLoading(false);
        });
    // userRoles reference changes when user loads — stringify to get stable comparison
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, userRoles.join(',')]);

    const switchRole = async (role: UserRole) => {
        if (role === currentRole) return;
        if (!isRoleAllowed(role, userRoles)) return;
        setIsLoading(true);
        await persistRole(role);
        setCurrentRole(role);
        setIsLoading(false);
    };

    return (
        <RoleContext.Provider value={{ currentRole, isLoading, switchRole }}>
            {children}
        </RoleContext.Provider>
    );
};
