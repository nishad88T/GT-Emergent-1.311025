import React from 'react';
import emergentAPI from '@/api/emergentClient';

export default function FeatureGuard({ children, requiredFeature, fallback = null }) {
    // For now, return children directly as we don't have feature gating implemented
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