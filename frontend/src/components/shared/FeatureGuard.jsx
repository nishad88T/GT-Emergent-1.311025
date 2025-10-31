import React, { createContext, useContext, useState, useEffect } from 'react';
import emergentAPI from '@/api/emergentClient';

// Create User Context
const UserContext = createContext(null);

// User Context Provider
function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [features, setFeatures] = useState({
        hasAdvancedAnalytics: true,
        hasRecipes: true,
        hasMealPlanning: true,
        scanLimit: 999,
        tier: 'admin',
        monthly_scan_count: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = async () => {
        try {
            setIsLoading(true);
            const userData = await emergentAPI.auth.me();
            setUser(userData);
            
            // Set features based on user data or defaults
            setFeatures({
                hasAdvancedAnalytics: true,
                hasRecipes: true,
                hasMealPlanning: true,
                scanLimit: userData?.scanLimit || 999,
                tier: userData?.role === 'admin' ? 'admin' : 'family',
                monthly_scan_count: userData?.monthly_scan_count || 0
            });
        } catch (error) {
            console.error('Error loading user:', error);
            // Set default features even if user fetch fails
            setFeatures({
                hasAdvancedAnalytics: true,
                hasRecipes: true,
                hasMealPlanning: true,
                scanLimit: 999,
                tier: 'lite',
                monthly_scan_count: 0
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, features, isLoading, refetch: loadUser }}>
            {children}
        </UserContext.Provider>
    );
}

// Hook to use user context
export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        // Return defaults if context not available
        return {
            user: null,
            features: {
                hasAdvancedAnalytics: true,
                hasRecipes: true,
                hasMealPlanning: true,
                scanLimit: 999,
                tier: 'lite',
                monthly_scan_count: 0
            },
            isLoading: false,
            refetch: () => Promise.resolve()
        };
    }
    return context;
}

// Hook for features specifically
export function useUserFeatures() {
    const { features, isLoading } = useUserContext();
    return {
        ...features,
        hasFeature: (featureName) => features[featureName] || false,
        isLoading
    };
}

// Feature Guard Component
function FeatureGuard({ children, requires, fallbackTitle, fallbackDescription }) {
    const { features } = useUserContext();
    
    // For now, always allow access
    return children;
}

// Feature Provider (legacy support)
function FeatureProvider({ children }) {
    return <UserProvider>{children}</UserProvider>;
}

// Scan Limit Guard
function ScanLimitGuard({ children }) {
    const { features } = useUserContext();
    
    if (features.monthly_scan_count >= features.scanLimit) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Scan Limit Reached</h2>
                <p>You've reached your monthly scan limit of {features.scanLimit}.</p>
                <p>Please upgrade your plan to continue scanning.</p>
            </div>
        );
    }
    
    return children;
}

// Export all components and hooks
export { FeatureGuard, FeatureProvider, ScanLimitGuard, UserProvider };
export default FeatureGuard;