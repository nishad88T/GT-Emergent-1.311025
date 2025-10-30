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

export function useUserFeatures() {
    // Return empty features for now
    return {
        features: [],
        hasFeature: () => false,
        isLoading: false
    };
}

// Export both as default and named export
export { FeatureGuard, FeatureProvider };
export default FeatureGuard;