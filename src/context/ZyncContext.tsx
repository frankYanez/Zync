import { Establishment, MOCK_ESTABLISHMENTS } from '@/infrastructure/mock-data';
import React, { createContext, useContext, useState } from 'react';

interface ZyncContextType {
    currentEstablishment: Establishment | null;
    setEstablishment: (establishment: Establishment) => void;
    // Add other global app state here (e.g., theme, language, etc.)
}

const ZyncContext = createContext<ZyncContextType>({} as ZyncContextType);

export const ZyncProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentEstablishment, setCurrentEstablishment] = useState<Establishment | null>(MOCK_ESTABLISHMENTS[0]);

    return (
        <ZyncContext.Provider
            value={{
                currentEstablishment,
                setEstablishment: setCurrentEstablishment,
            }}
        >
            {children}
        </ZyncContext.Provider>
    );
};

export const useZync = () => useContext(ZyncContext);
