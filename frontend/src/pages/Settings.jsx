
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CURRENCY_SYMBOLS } from '../components/utils/currency';
import {
    CreditCard,
    DollarSign,
    LogOut,
    User as UserIcon,
    Palette,
    Zap,
    HeartPulse,
    ShieldCheck,
    Star,
    Save,
    Trash2,
    Bell,
    Settings
} from 'lucide-react';
import MobileAppInstructions from '../components/settings/MobileAppInstructions';
import DataRecoverySection from '@/components/settings/DataRecoverySection';
import { useUserFeatures } from '@/components/shared/FeatureGuard';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { base44 } from "@/api/base44Client";


export default function SettingsPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState('GBP');
    const [weekStartsOn, setWeekStartsOn] = useState(1); // Default to Monday (1)
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const features = useUserFeatures();


    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
                setCurrency(currentUser.currency || 'GBP');
                setWeekStartsOn(currentUser.week_starts_on ?? 1); // Set from user data, default to Monday
            } catch (error) {
                console.error("Failed to fetch user:", error);
                toast.error("Could not load your settings. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await base44.auth.updateMe({ 
                currency,
                week_starts_on: weekStartsOn
            });
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleLogout = async () => {
        try {
            await base44.auth.logout();
            window.location.reload();
        } catch(error) {
            toast.error("Logout failed. Please try again.");
        }
    }
    
    const handleManageSubscription = () => {
        toast.info("Subscription management coming soon!", {
            description: "You'll be able to manage your plan here."
        });
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const response = await base44.functions.invoke('deleteUserAccount');
            if (response.data && response.data.message) {
                toast.success(response.data.message);
                setTimeout(async () => {
                    await base44.auth.logout();
                    window.location.href = '/';
                }, 2000);
            }
        } catch (error) {
            console.error("Account deletion failed:", error);
            toast.error(error.response?.data?.error || "Failed to delete account. Please try again or contact support.");
            setIsDeleting(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading settings...</div>;
    }

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Settings</h1>
                        <p className="text-slate-600">Manage your account and preferences.</p>
                    </div>
                </div>

                {/* Profile Settings */}
                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-slate-600" />
                            My Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label className="block text-sm font-medium text-slate-700">Full Name</Label>
                            <Input value={user?.full_name || ''} disabled className="mt-1 bg-slate-100" />
                        </div>
                        <div>
                            <Label className="block text-sm font-medium text-slate-700">Email</Label>
                            <Input value={user?.email || ''} disabled className="mt-1 bg-slate-100" />
                        </div>
                            <div>
                            <Label className="block text-sm font-medium text-slate-700">Preferred Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => (
                                        <SelectItem key={code} value={code}>{symbol} - {code}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="block text-sm font-medium text-slate-700">Week Starts On</Label>
                            <Select value={weekStartsOn.toString()} onValueChange={(v) => setWeekStartsOn(parseInt(v))}>
                                <SelectTrigger className="w-full mt-1">
                                    <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Sunday</SelectItem>
                                    <SelectItem value="1">Monday</SelectItem>
                                    <SelectItem value="2">Tuesday</SelectItem>
                                    <SelectItem value="3">Wednesday</SelectItem>
                                    <SelectItem value="4">Thursday</SelectItem>
                                    <SelectItem value="5">Friday</SelectItem>
                                    <SelectItem value="6">Saturday</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500 mt-1">
                                This affects your meal planning calendar and weekly views
                            </p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : "Save Preferences"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* My Subscriptions */}
                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-emerald-600" />
                            My Subscription
                        </CardTitle>
                            <CardDescription>
                            Manage your GroceryTrack™ subscription plan.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Core Subscription */}
                        <div className="p-4 border rounded-lg bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    {features.tier === 'admin' ? (
                                        <>
                                            <ShieldCheck className="w-5 h-5 text-indigo-600"/>
                                            <span>GroceryTrack™ Admin</span>
                                        </>
                                    ) : features.tier === 'family' ? (
                                        <>
                                            <Star className="w-5 h-5 text-yellow-500"/>
                                            <span>GroceryTrack™ Family</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>☕</span>
                                            <span>GroceryTrack™ Lite</span>
                                        </>
                                    )}
                                </h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    {features.tier === 'admin' ? (
                                        `Admin account: Unlimited access to all features`
                                    ) : features.tier === 'lite' ? (
                                        `Lite plan: £2.59/month or £25.99/year`
                                    ) : (
                                        `Family plan: £5.99/month or £59.99/year`
                                    )}
                                </p>
                                <p className="text-sm text-slate-600 mt-1">
                                    {features.tier === 'admin' ? (
                                        `Full analytics + admin tools — Unlimited scans`
                                    ) : features.tier === 'lite' ? (
                                        `Full analytics — ${features.scanLimit} scans/month`
                                    ) : (
                                        `Full analytics + household sharing — ${features.scanLimit} scans/month`
                                    )}
                                </p>
                                {features.tier !== 'admin' && (
                                    <p className="text-xs text-slate-500 mt-2">
                                        Used this month: {features.monthly_scan_count || 0} / {features.scanLimit}
                                    </p>
                                )}
                                {features.tier === 'admin' && (
                                    <p className="text-xs text-indigo-600 mt-2 font-medium">
                                        ✓ All features unlocked • No scan limits • Admin access
                                    </p>
                                )}
                            </div>
                            {features.tier !== 'admin' && (
                                <Button onClick={handleManageSubscription} variant="outline" className="w-full sm:w-auto">
                                    <Zap className="w-4 h-4 mr-2" />
                                    Manage Plan
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Mobile App Instructions */}
                <MobileAppInstructions />
                
                {/* Data Recovery Section */}
                <DataRecoverySection />

                {/* Account Information - Only show if user is admin */}
                {user?.role === 'admin' && (
                    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="w-5 h-5 text-indigo-600" />
                                Account Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <Label className="text-xs text-slate-600">User ID</Label>
                                <p className="text-sm font-mono text-slate-800">{user.id}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <Label className="text-xs text-slate-600">Household ID</Label>
                                <p className="text-sm font-mono text-slate-800">{user.household_id || 'Not assigned'}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Danger Zone */}
                <Card className="border-red-200 bg-red-50 shadow-lg backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-red-700 flex items-center gap-2">
                            <Trash2 className="w-5 h-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="text-red-600">
                            Irreversible actions that will permanently affect your account and data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-white rounded-lg border border-red-200">
                            <h4 className="font-semibold text-slate-900 mb-2">Delete My Account</h4>
                            <p className="text-sm text-slate-700 mb-4">
                                Permanently delete your GroceryTrack account and all associated data. This action cannot be undone.
                            </p>
                            <ul className="text-sm text-slate-600 space-y-1 mb-4 ml-4 list-disc">
                                <li>All receipts and purchase history will be permanently deleted</li>
                                <li>All budgets and financial tracking data will be removed</li>
                                <li>All analytics and insights will be lost</li>
                                <li>Your account will be immediately logged out</li>
                                <li>This action is required by UK GDPR and cannot be reversed</li>
                            </ul>

                            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="destructive" 
                                        disabled={isDeleting}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {isDeleting ? "Deleting Account..." : "Delete My Account"}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-red-700">Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="space-y-3">
                                            <p className="font-semibold text-slate-900">
                                                This will permanently delete your account and remove all your data from our servers.
                                            </p>
                                            <p className="text-slate-700">
                                                This action cannot be undone. All your receipts, budgets, analytics, and insights will be permanently lost.
                                            </p>
                                            <p className="text-slate-700">
                                                If you're experiencing issues, please consider contacting support at{' '}
                                                <a href="mailto:support@grocerytrack.co.uk" className="text-red-600 hover:underline font-medium">
                                                    support@grocerytrack.co.uk
                                                </a>
                                                {' '}before deleting your account.
                                            </p>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                setShowDeleteDialog(false);
                                                handleDeleteAccount();
                                            }}
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>

                {/* Logout Button */}
                <div className="text-center mt-8">
                    <Button variant="ghost" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>
        </div>
    );
}
