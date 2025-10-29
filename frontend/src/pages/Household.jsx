import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities';
import { Household } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Users, Loader2, AlertTriangle, Wrench, CheckCircle, Info } from 'lucide-react';
import InviteForm from '@/components/household/InviteForm';
import PendingInvites from '@/components/household/PendingInvites';

const HouseholdPage = () => {
    const [household, setHousehold] = useState(null);
    const [members, setMembers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [fixing, setFixing] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);
            
            const user = await User.me();
            setCurrentUser(user);

            if (!user) {
                setError("no_user");
                setLoading(false);
                return;
            }

            if (!user.household_id) {
                setError("no_household");
                setLoading(false);
                return;
            }

            // Use .filter() to safely check for the household without causing a 404 error.
            const householdResults = await Household.filter({ id: user.household_id });

            if (householdResults && householdResults.length > 0) {
                const householdData = householdResults[0];
                setHousehold(householdData);

                const membersData = await User.filter({ household_id: user.household_id });
                setMembers(membersData || []);
                
                // If we just fixed the household, show success message
                if (sessionStorage.getItem('householdJustFixed')) {
                    setSuccessMessage("✅ Your household has been successfully created and linked to your account!");
                    sessionStorage.removeItem('householdJustFixed');
                }
            } else {
                console.warn("User is linked to a non-existent household. Presenting the fix UI.");
                setError("household_not_found");
            }
            
        } catch (err) {
            console.error("Critical error in loadData:", err);
            setError("general_error");
        } finally {
            setLoading(false);
        }
    }, []);

    const manualFix = async () => {
        setFixing(true);
        setError(null);
        setSuccessMessage(null);
        
        try {
            console.log("Starting comprehensive household fix...");
            
            // Step 1: Clear the invalid household_id
            await User.updateMyUserData({ household_id: null });
            console.log("Cleared invalid household_id");
            
            // Step 2: Create a new household
            const newHousehold = await Household.create({
                name: `${currentUser?.full_name || currentUser?.email || 'User'}'s Household`,
                admin_id: currentUser.id
            });
            console.log("Created new household:", newHousehold.id);
            
            // Step 3: Link user to new household
            await User.updateMyUserData({ household_id: newHousehold.id });
            console.log("Linked user to new household");

            // Step 4: Update component state immediately
            const updatedUser = { ...currentUser, household_id: newHousehold.id };
            setCurrentUser(updatedUser);
            setHousehold(newHousehold);
            setMembers([updatedUser]);
            setError(null);
            
            // Mark that we just fixed the household for success message
            sessionStorage.setItem('householdJustFixed', 'true');
            
            setSuccessMessage("🎉 Household successfully created! You can now invite family members and use all household features.");
            console.log("Household fix complete.");

        } catch (error) {
            console.error('Manual fix failed:', error);
            setError("fix_failed");
        } finally {
            setFixing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading) {
        return (
            <div className="p-4 md:p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
                    <p className="text-slate-600">Loading household...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen">
                <div className="max-w-4xl mx-auto">
                    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-700">
                                <AlertTriangle className="w-5 h-5" />
                                {error === "household_not_found" || error === "no_household" ? "Household Setup Required" : "Account Setup Required"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {error === "no_household" && (
                                <div>
                                    <p className="text-slate-700 mb-4">
                                        You need a household to track receipts and manage budgets. Let's create one for you.
                                    </p>
                                </div>
                            )}
                            
                            {error === "household_not_found" && (
                                <div>
                                    <p className="text-slate-700 mb-2">
                                        Your account's household link needs to be repaired. This is a quick, one-time fix.
                                    </p>
                                    <p className="text-sm text-slate-500 mb-4">
                                        After fixing this, use the Data Recovery tool in Settings to restore your receipts.
                                    </p>
                                </div>
                            )}

                            {error === "fix_failed" && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-700 text-sm">
                                        The fix failed. Please refresh and try again. If the problem persists, contact support.
                                    </p>
                                </div>
                            )}

                            <Button 
                                onClick={manualFix} 
                                disabled={fixing} 
                                className="w-full bg-emerald-600 hover:bg-emerald-700 py-3 text-lg"
                            >
                                {fixing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Creating Your Household...
                                    </>
                                ) : (
                                    <>
                                        <Wrench className="w-5 h-5 mr-2" />
                                        {error === "no_household" ? "Create My Household" : "Fix My Household"}
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const isCurrentUserAdmin = currentUser?.id === household?.admin_id;

    return (
        <div className="p-4 md:p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                       <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{household?.name || 'Household'}</h1>
                        <p className="text-slate-600">Manage your shared household and members.</p>
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <p className="text-green-800 font-medium">{successMessage}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Household Members ({members.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {members.map(member => (
                                <li key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Avatar><AvatarFallback>{member.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar>
                                        <div>
                                            <p className="font-semibold text-slate-800">{member.full_name || 'Unknown'}</p>
                                            <p className="text-sm text-slate-600">{member.email}</p>
                                        </div>
                                    </div>
                                    {member.id === household?.admin_id && (
                                        <div className="flex items-center gap-2 text-yellow-600 font-medium text-sm">
                                            <Crown className="w-4 h-4" /><span>Admin</span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {isCurrentUserAdmin && (
                    <div className="space-y-4">
                        <InviteForm householdId={household?.id} inviterName={currentUser?.full_name || 'Unknown User'} />
                    </div>
                )}

                {household?.id && (
                    <div className="space-y-4">
                        <PendingInvites householdId={household.id} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HouseholdPage;