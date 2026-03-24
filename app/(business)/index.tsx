import BusinessHomeScreen from '@/features/dashboard/screens/BusinessHomeScreen';
import DjHomeScreen from '@/features/dj/screens/DjHomeScreen';
import { useRoleManager } from '@/hooks/useRoleManager';

export default function BusinessHomeIndex() {
    const { currentRole } = useRoleManager();
    return currentRole === 'dj' ? <DjHomeScreen /> : <BusinessHomeScreen />;
}
