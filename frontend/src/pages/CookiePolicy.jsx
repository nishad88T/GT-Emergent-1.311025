import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, Settings, Eye, FileWarning, Mail } from 'lucide-react';
import LegalFooter from '@/components/shared/LegalFooter';

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
    </div>
    <div className="text-slate-700 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6 md:py-12">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Cookie Policy</h1>
              <p className="text-slate-600 text-sm mt-1">Last updated: 14 October 2025</p>
            </div>
          </div>
          <div className="text-slate-600 space-y-1">
            <p><strong>Operated by:</strong> GroceryTrack Analytics, United Kingdom</p>
            <p><strong>Contact:</strong> <a href="mailto:support@grocerytrack.co.uk" className="text-orange-600 hover:underline">support@grocerytrack.co.uk</a></p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm mb-8">
            <CardContent className="p-6 md:p-8 space-y-8">
              
              {/* What Are Cookies */}
              <Section icon={Cookie} title="1. What Are Cookies">
                <p>
                  Cookies are small text files stored on your device when you visit a website or app. They help improve your experience and enable basic functionality.
                </p>
              </Section>

              {/* How We Use Cookies */}
              <Section icon={Eye} title="2. How We Use Cookies">
                <p>
                  GroceryTrack Analytics uses only <strong>essential and functional cookies</strong>, such as:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Session cookies to keep you logged in securely.</li>
                  <li>Cookies to remember your language or display preferences.</li>
                  <li>Cookies used by Base44 and Vercel for basic hosting and security.</li>
                </ul>
                <p className="mt-4 font-semibold">We do not use cookies for advertising or profiling.</p>
              </Section>

              {/* Managing Cookies */}
              <Section icon={Settings} title="3. Managing Cookies">
                <p>
                  Most browsers let you block or delete cookies via their settings. If you disable essential cookies, parts of the Service may not function correctly.
                </p>
              </Section>

              {/* Updates to This Policy */}
              <Section icon={FileWarning} title="4. Updates to This Policy">
                <p>
                  We may update this Cookie Policy to reflect changes in our technology or legal obligations.
                </p>
              </Section>

              {/* Contact */}
              <Section icon={Mail} title="5. Contact">
                <p>
                  For questions, contact <a href="mailto:support@grocerytrack.co.uk" className="text-orange-600 hover:underline font-semibold">support@grocerytrack.co.uk</a> or use our in-app support form.
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