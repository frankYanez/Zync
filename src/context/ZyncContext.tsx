import { Establishment } from '@/infrastructure/mock-data';
import React, { createContext, useContext, useState } from 'react';

interface ZyncContextType {
    currentEstablishment: Establishment | null;
    setEstablishment: (establishment: Establishment) => void;
}

const ZyncContext = createContext<ZyncContextType>({} as ZyncContextType);

export const ZyncProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentEstablishment, setCurrentEstablishment] = useState<Establishment | null>(null);

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
