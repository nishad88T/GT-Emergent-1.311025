import React from 'react';
import emergentAPI from '@/api/emergentClient';

function FeatureGuard({ children, requiredFeature, fallback = null }) {
    // For now, return children directly as we don't have feature gating implemented
    return children;
}

function FeatureProvider({ children }) {
    // Provider for feature context - placeholder implementation
    return children;
}

function ScanLimitGuard({ children }) {
    // Scan limit guard - placeholder implementation
    return children;
}

export function useUserFeatures() {
    // Return empty features for now
    return {
        features: [],
        hasFeature: () => false,
        isLoading: false
    };
}

export function useUserContext() {
    // Return empty user context for now
    return {
        user: null,
        isLoading: false,
        refetch: () => Promise.resolve()
    };
}

// Export all components and hooks
export { FeatureGuard, FeatureProvider, ScanLimitGuard };
export default FeatureGuard;