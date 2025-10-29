import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HouseholdInvitation } from '@/api/entities';
import { Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PendingInvites = ({ householdId }) => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInvitations = async () => {
            try {
                console.log("Loading invitations for household:", householdId);
                if (!householdId) return;
                
                const inviteData = await HouseholdInvitation.filter({ household_id: householdId });
                console.log("Loaded invitations:", inviteData);
                setInvitations(inviteData || []);
            } catch (error) {
                console.error("Error loading invitations:", error);
                setInvitations([]);
            } finally {
                setLoading(false);
            }
        };
        
        loadInvitations();
    }, [householdId]);

    if (loading) {
        return (
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
            </CardHeader>
            <CardContent>
                {invitations.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No pending invitations.</p>
                ) : (
                    <ul className="space-y-3">
                        {invitations.map((invitation) => (
                            <li key={invitation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-gray-800">{invitation.invitee_email}</p>
                                    <p className="text-sm text-gray-600">
                                        Invited by {invitation.inviter_name} • {formatDistanceToNow(new Date(invitation.created_date), { addSuffix: true })}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {invitation.status === 'pending' && (
                                        <div className="flex items-center text-yellow-600">
                                            <Clock className="w-4 h-4 mr-1" />
                                            <span className="text-sm font-medium">Pending</span>
                                        </div>
                                    )}
                                    {invitation.status === 'accepted' && (
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            <span className="text-sm font-medium">Accepted</span>
                                        </div>
                                    )}
                                    {invitation.status === 'expired' && (
                                        <div className="flex items-center text-red-600">
                                            <XCircle className="w-4 h-4 mr-1" />
                                            <span className="text-sm font-medium">Expired</span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};

export default PendingInvites;