
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, Copy, Check, Mail } from 'lucide-react';
import { sendInvitation } from '@/api/functions';
import { HouseholdInvitation } from '@/api/entities';

const InviteForm = ({ householdId, inviterName }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [invitationLink, setInvitationLink] = useState(null);
    const [linkCopied, setLinkCopied] = useState(false);

    const generateToken = () => {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    };

    const showToast = (message, type = 'success') => {
        if (type === 'error') {
            alert(`Error: ${message}`);
        } else {
            alert(message);
        }
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
            showToast('Invitation link copied to clipboard!');
        } catch (error) {
            showToast('Failed to copy to clipboard', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            showToast("Email is required", "error");
            return;
        }
        setLoading(true);
        setInvitationLink(null);

        try {
            const token = generateToken();
            const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

            // 1. Create invitation record in the database
            const newInvitation = await HouseholdInvitation.create({
                household_id: householdId,
                invitee_email: email,
                inviter_name: inviterName,
                token: token,
                expires_at: expires_at,
            });

            // 2. Generate the invitation link
            const generatedLink = `${window.location.origin}/join?token=${token}`;
            
            // 3. Try to send email via backend function
            try {
                const response = await sendInvitation({
                    invitee_email: email,
                    inviter_name: inviterName,
                    invitation_link: generatedLink,
                });
                
                // Check if email was actually sent
                if (response.data && response.data.email_sent) {
                    showToast(`An invitation email has been sent to ${email}.`);
                } else {
                    // Email couldn't be sent (e.g., external user), provide manual link
                    setInvitationLink(generatedLink);
                    showToast(`Invitation created! ${email} is not registered in the app, so please share the link below manually.`);
                }
                
            } catch (emailError) {
                // Backend function failed or email couldn't be sent for another reason
                console.log("Email sending failed via backend, providing manual link:", emailError);
                setInvitationLink(generatedLink);
                showToast(`Invitation created! Please share the link below with ${email} manually.`);
            }

            // Clear the email field
            setEmail('');
            
        } catch (error) {
            // Only database/invitation creation errors should reach here
            console.error("Failed to create invitation:", error);
            showToast(`Failed to create invitation: ${error.message}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Invite New Member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                    <Input
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="flex-grow"
                    />
                    <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                        {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Invite
                    </Button>
                </form>
                
                {/* Manual link sharing fallback */}
                {invitationLink && (
                    <Alert className="border-blue-200 bg-blue-50">
                        <Mail className="h-4 w-4" />
                        <AlertDescription>
                            <div className="space-y-3">
                                <p className="text-sm text-blue-800">
                                    <strong>Manual Sharing Required:</strong> Please copy and share this invitation link:
                                </p>
                                <div className="flex items-center gap-2 p-2 bg-white rounded border">
                                    <code className="flex-grow text-xs break-all text-slate-600">
                                        {invitationLink}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyToClipboard(invitationLink)}
                                        disabled={linkCopied}
                                    >
                                        {linkCopied ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-blue-700">
                                    This link expires in 7 days. The person will be added to your household when they click the link and sign in.
                                </p>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
};

export default InviteForm;
