import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Lock, Database, Eye, FileWarning, Mail } from 'lucide-react';
import LegalFooter from '@/components/shared/LegalFooter';

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>
    <div className="text-slate-700 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-slate-600 text-sm mt-1">Last updated: 14 October 2025</p>
            </div>
          </div>
          <div className="text-slate-600 space-y-1">
            <p><strong>Operated by:</strong> GroceryTrack Analytics, United Kingdom</p>
            <p><strong>Contact:</strong> <a href="mailto:support@grocerytrack.co.uk" className="text-emerald-600 hover:underline">support@grocerytrack.co.uk</a></p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm mb-8">
            <CardContent className="p-6 md:p-8 space-y-8">
              
              {/* Overview */}
              <Section icon={Eye} title="1. Overview">
                <p>
                  This Privacy Policy explains how we collect, use, and protect your information when you use GroceryTrack Analytics (the "Service"). We comply with the UK General Data Protection Regulation (UK GDPR).
                </p>
              </Section>

              {/* Information We Collect */}
              <Section icon={Database} title="2. Information We Collect">
                <p>We collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account information:</strong> email address, password, and subscription status.</li>
                  <li><strong>Receipt data:</strong> items, prices, and store details entered or scanned. Users are advised to obscure payment information.</li>
                  <li><strong>Usage data:</strong> number of scans, preferences, and app interactions.</li>
                  <li><strong>Payment data:</strong> processed by third-party providers (e.g., Stripe). We do not store card details.</li>
                  <li><strong>Anonymous crowd data:</strong> store name, item, and price (without personal identifiers), stored on a rolling 10-day basis for price analysis.</li>
                </ul>
              </Section>

              {/* How We Use Your Data */}
              <Section icon={Lock} title="3. How We Use Your Data">
                <p>We use your data to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Operate the receipt scanning and analytics features.</li>
                  <li>Provide insights such as spending trends, inflation comparison, and nutritional summaries.</li>
                  <li>Manage subscriptions and payments.</li>
                  <li>Maintain and improve the Service.</li>
                  <li>Communicate updates or support messages.</li>
                </ul>
                <p className="font-semibold mt-4">We do not sell, trade, or rent user data.</p>
              </Section>

              {/* Data Sharing and Processors */}
              <Section icon={FileWarning} title="4. Data Sharing and Processors">
                <p>Your data may be processed by:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Base44</strong> – for hosting and core app functionality.</li>
                  <li><strong>Vercel</strong> – for web hosting and landing pages.</li>
                  <li><strong>Stripe</strong> – for secure payment processing.</li>
                </ul>
                <p className="mt-4">All processors are bound by confidentiality and data protection agreements.</p>
              </Section>

              {/* Data Transfers */}
              <Section icon={Mail} title="5. Data Transfers">
                <p>
                  Base44's servers are currently located in the United States. Data transfers follow approved UK GDPR mechanisms (e.g., Standard Contractual Clauses). We will update this section once Base44 confirms its transfer framework.
                </p>
              </Section>

              {/* Data Retention */}
              <Section icon={Database} title="6. Data Retention">
                <ul className="list-disc pl-6 space-y-2">
                  <li>User-level data is stored for up to <strong>one year</strong>, unless you request earlier deletion.</li>
                  <li>Anonymous crowd-sourced data is retained for up to <strong>10 days</strong>.</li>
                  <li>Trial user data is deleted automatically after inactivity beyond the retention period.</li>
                </ul>
              </Section>

              {/* Security */}
              <Section icon={Lock} title="7. Security">
                <p>
                  We use encryption, secure storage, and access controls to protect your data. However, no online system is completely secure; you use the Service at your own risk.
                </p>
              </Section>

              {/* Your Rights */}
              <Section icon={ShieldCheck} title="8. Your Rights">
                <p>You may:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request access to your data via the dashboard or by contacting support.</li>
                  <li>Request correction or deletion.</li>
                  <li>Withdraw consent at any time.</li>
                  <li>File a complaint with the Information Commissioner's Office (ICO) in the UK.</li>
                </ul>
              </Section>

              {/* Children's Privacy */}
              <Section icon={ShieldCheck} title="9. Children's Privacy">
                <p>
                  The Service is not intended for children under 16. We do not knowingly collect their data.
                </p>
              </Section>

              {/* Changes to This Policy */}
              <Section icon={FileWarning} title="10. Changes to This Policy">
                <p>
                  We may update this Policy periodically. We will notify users of significant changes via email or in-app notice.
                </p>
              </Section>

              {/* Contact */}
              <Section icon={Mail} title="11. Contact">
                <p>
                  Questions? Contact us at <a href="mailto:support@grocerytrack.co.uk" className="text-emerald-600 hover:underline font-semibold">support@grocerytrack.co.uk</a> or via the in-app form.
                </p>
              </Section>

            </CardContent>
          </Card>
        </motion.div>

        <LegalFooter />
      </div>
    </div>
  );
}