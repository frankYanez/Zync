import React, { createContext, ReactNode, useContext, useState } from 'react';

export type UserRole = 'user' | 'business' | 'dj';

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

interface RoleProviderProps {
    children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
    const [currentRole, setCurrentRole] = useState<UserRole>('user');
    const [isLoading, setIsLoading] = useState(false);

    const switchRole = async (role: UserRole) => {
        if (role === currentRole) return;
        setIsLoading(true);
        // Simulate API call latency
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurrentRole(role);
        setIsLoading(false);
    };

    return (
        <RoleContext.Provider value={{ currentRole, isLoading, switchRole }}>
            {children}
        </RoleContext.Provider>
    );
};
