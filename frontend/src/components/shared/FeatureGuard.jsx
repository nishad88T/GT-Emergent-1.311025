
import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const FeatureContext = createContext(null);

export const TIER_CONFIG = {
    lite: {
        scanLimit: 12, // £2.59/month or £25.99/year
        hasAdvancedAnalytics: true,
        hasFullNutrition: true,
        hasNutritionDiagnostics: false,
        hasFeatureGuideAccess: false,
        hasTrialDataModeler: false,
        hasAccessToRecipes: false,
        aiEnhancementLimit: 1, // 1 AI enhancement per month for lite
    },
    family: {
        scanLimit: 30, // £5.99/month or £59.99/year - includes household sharing
        hasAdvancedAnalytics: true,
        hasFullNutrition: true,
        hasNutritionDiagnostics: false,
        hasFeatureGuideAccess: false,
        hasTrialDataModeler: false,
        hasAccessToRecipes: false,
        aiEnhancementLimit: 4, // 4 AI enhancements per month (1 per week) for family
    },
    admin: {
        scanLimit: Infinity, // Unlimited scans
        hasAdvancedAnalytics: true,
        hasFullNutrition: true,
        hasNutritionDiagnostics: true,
        hasFeatureGuideAccess: true,
        hasTrialDataModeler: true,
        hasAccessToRecipes: true,
        aiEnhancementLimit: Infinity, // Unlimited for admin
    }
};

export function FeatureProvider({ children }) {
    const [features, setFeatures] = useState({ ...TIER_CONFIG.lite, loading: true });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUserFeatures = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                
                // Check if user has admin role first - highest priority
                if (currentUser && currentUser.role === 'admin') {
                    console.log("Admin user detected, granting unlimited access.");
                    setFeatures({ 
                        ...TIER_CONFIG.admin, 
                        loading: false, 
                        tier: 'admin', 
                        monthly_scan_count: currentUser?.monthly_scan_count || 0,
                        ai_enhancement_count: currentUser?.ai_enhancement_count_this_month || 0
                    });
                    return;
                }
                
                // Regular user tier logic
                const tier = currentUser?.tier || 'lite'; // Default to lite
                let config = { ...(TIER_CONFIG[tier] || TIER_CONFIG.lite) };

                // Apply individual trial feature flags from the user record
                if (currentUser.hasTrialAdvancedAnalytics) {
                    config.hasAdvancedAnalytics = true;
                }
                
                if (currentUser.hasTrialNutritionDiagnostics) {
                    config.hasNutritionDiagnostics = true;
                }
                if (currentUser.hasTrialFeatureGuide) {
                    config.hasFeatureGuideAccess = true;
                }
                if (currentUser.hasTrialDataModeler) {
                    config.hasTrialDataModeler = true;
                }
                if (currentUser.hasAccessToRecipes) {
                    config.hasAccessToRecipes = true;
                }

                setFeatures({ 
                    ...config, 
                    loading: false, 
                    tier: tier, 
                    monthly_scan_count: currentUser?.monthly_scan_count || 0,
                    ai_enhancement_count: currentUser?.ai_enhancement_count_this_month || 0
                });
            } catch (error) {
                console.warn("User not logged in, applying default lite tier features.");
                setFeatures({ ...TIER_CONFIG.lite, loading: false, tier: 'lite', monthly_scan_count: 0, ai_enhancement_count: 0 });
            }
        };
        loadUserFeatures();
    }, []);

    return (
        <FeatureContext.Provider value={{ features, user }}>
            {children}
        </FeatureContext.Provider>
    );
}

export const useUserFeatures = () => {
    const context = useContext(FeatureContext);
    if (!context) {
        throw new Error('useUserFeatures must be used within a FeatureProvider');
    }
    return context.features;
};

export const useUserContext = () => {
    const context = useContext(FeatureContext);
    if (!context) {
        throw new Error('useUserContext must be used within a FeatureProvider');
    }
    return context;
};

export function FeatureGuard({ children, requires, fallbackTitle, fallbackDescription }) {
    const { hasAdvancedAnalytics, hasFullNutrition, hasNutritionDiagnostics, hasFeatureGuideAccess, hasTrialDataModeler, hasAccessToRecipes, loading, tier } = useUserFeatures();
    const navigate = useNavigate();

    if (loading) {
        return <div className="p-8 text-center">Loading features...</div>;
    }

    // Admin has access to everything
    if (tier === 'admin') {
        return children;
    }

    let isAllowed = true;
    if (requires === 'advanced-analytics' && !hasAdvancedAnalytics) isAllowed = false;
    if (requires === 'nutrition' && !hasFullNutrition) isAllowed = false;
    if (requires === 'nutrition-diagnostics' && !hasNutritionDiagnostics) isAllowed = false;
    if (requires === 'feature-guide' && !hasFeatureGuideAccess) isAllowed = false;
    if (requires === 'data-modeler' && !hasTrialDataModeler) isAllowed = false;
    if (requires === 'recipes' && !hasAccessToRecipes) isAllowed = false;


    if (isAllowed) {
        return children;
    }

    return (
        <div className="p-4 md:p-8">
             <Card className="border-orange-200 bg-orange-50/80 shadow-lg text-center">
                <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-2">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-orange-900">{fallbackTitle || "Feature Access"}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-orange-800 mb-6">{fallbackDescription || "This feature requires additional access."}</p>
                    <Button onClick={() => navigate(createPageUrl('Settings'))} className="bg-orange-500 hover:bg-orange-600">
                        <Zap className="w-4 h-4 mr-2" />
                        Manage Subscriptions
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export function ScanLimitGuard({ children, onUpgrade }) {
    const { scanLimit, monthly_scan_count, loading, tier } = useUserFeatures();

    if (loading) {
        return <div className="p-8 text-center">Loading scan limit...</div>;
    }

    // Admin has unlimited scans
    if (tier === 'admin') {
        return children;
    }

    if (monthly_scan_count >= scanLimit) {
        return (
            <div className="p-4 md:p-8">
                <Card className="border-red-200 bg-red-50/80 shadow-lg text-center">
                    <CardHeader>
                         <div className="mx-auto w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-2">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle className="text-red-900">Monthly Scan Limit Reached</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-800 mb-6">
                            You have used {monthly_scan_count} of your {scanLimit} scans for this month.
                        </p>
                        <div className="space-y-3">
                            <Button onClick={onUpgrade} className="bg-red-500 hover:bg-red-600 w-full">
                                <Zap className="w-4 h-4 mr-2" />
                                {tier === 'lite' 
                                    ? 'Upgrade to Family (30 scans/month)'
                                    : 'Contact Support for More Scans'
                                }
                            </Button>
                            {tier === 'lite' && (
                                <p className="text-xs text-red-600">
                                    Lite: £2.59/month (12 scans) • Family: £5.99/month (30 scans)
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    return children;
}
