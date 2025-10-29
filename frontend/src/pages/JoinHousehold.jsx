import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HouseholdInvitation, User, Household } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const JoinHouseholdPage = () => {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('loading'); // loading, success, error, info
    const [message, setMessage] = useState('Verifying your invitation...');
    const [invitation, setInvitation] = useState(null);
    const [household, setHousehold] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const processInvitation = async () => {
            const token = new URLSearchParams(location.search).get('token');
            if (!token) {
                setStatus('error');
                setMessage('No invitation token provided. Please use the link from your invitation email.');
                setLoading(false);
                return;
            }

            try {
                // 1. Verify token and get invitation details
                const invites = await HouseholdInvitation.filter({ token: token, status: 'pending' });
                if (invites.length === 0) {
                    setStatus('error');
                    setMessage('This invitation is invalid, has expired, or has already been accepted.');
                    setLoading(false);
                    return;
                }
                const currentInvite = invites[0];
                setInvitation(currentInvite);
                
                const householdData = await Household.get(currentInvite.household_id);
                setHousehold(householdData);

                // 2. Check current user status
                let user = null;
                try {
                    user = await User.me();
                } catch (e) {
                    // Not logged in
                }

                if (!user) {
                    // User is not logged in, prompt them to login/signup
                    setStatus('info');
                    setMessage(`You've been invited to join the "${householdData.name}" household by ${currentInvite.inviter_name}. Please log in or sign up to accept.`);
                    setLoading(false);
                    return; // Stop here and wait for user action
                }
                
                // User is logged in, proceed with joining
                if (user.email.toLowerCase() !== currentInvite.invitee_email.toLowerCase()) {
                    setStatus('error');
                    setMessage(`This invitation was for ${currentInvite.invitee_email}, but you are logged in as ${user.email}. Please log in with the correct account.`);
                    setLoading(false);
                    return;
                }

                if (user.household_id === currentInvite.household_id) {
                     setStatus('info');
                     setMessage(`You are already a member of the "${householdData.name}" household.`);
                     setLoading(false);
                     setTimeout(() => navigate('/dashboard'), 3000);
                     return;
                }

                // 3. Join the household
                await User.updateMyUserData({ household_id: currentInvite.household_id });

                // 4. Update invitation status
                await HouseholdInvitation.update(currentInvite.id, { status: 'accepted' });

                setStatus('success');
                setMessage(`Welcome to the "${householdData.name}" household! You will be redirected to your dashboard shortly.`);
                setLoading(false);

                setTimeout(() => navigate('/dashboard'), 3000);

            } catch (error) {
                setStatus('error');
                setMessage(`An error occurred: ${error.message}`);
                setLoading(false);
            }
        };

        processInvitation();
    }, [location, navigate]);

    const handleLogin = async () => {
        // Redirect to login, and come back here after.
        await User.loginWithRedirect(window.location.href);
    };
    
    const statusIcons = {
        loading: <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />,
        success: <CheckCircle className="w-12 h-12 text-green-600" />,
        error: <XCircle className="w-12 h-12 text-red-600" />,
        info: <CheckCircle className="w-12 h-12 text-blue-600" />,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        {statusIcons[status]}
                    </div>
                    <CardTitle className="text-2xl">
                        {status === 'loading' && 'Processing Invitation'}
                        {status === 'success' && 'Success!'}
                        {status === 'error' && 'Invitation Error'}
                        {status === 'info' && 'Join Household'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-slate-600 mb-6">{message}</p>
                    {status === 'info' && !loading && (
                        <Button onClick={handleLogin} className="w-full">
                            Login or Sign Up to Join
                        </Button>
                    )}
                     {status === 'success' && (
                        <Button onClick={() => navigate('/dashboard')} className="w-full">
                            Go to Dashboard Now
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default JoinHouseholdPage;