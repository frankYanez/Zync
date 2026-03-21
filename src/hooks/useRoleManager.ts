import { useRole } from '@/context/RoleContext';

export const useRoleManager = () => {
    const { currentRole, isLoading, switchRole } = useRole();

    return {
        currentRole,
        isLoading,
        switchRole,
    };
};
