
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanLine, Edit, PiggyBank, TrendingUp, CheckCircle, BookOpen, Camera, Calendar, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: ScanLine,
    title: "Scan Your Receipts Securely",
    description: "Go to the 'Scan Receipt' page to capture your grocery expenses. The app is designed to read the itemized list, so you don't need to worry about the rest.",
    details: [
      "IMPORTANT: Before scanning, fold or cross out any sensitive information on your receipt such as credit card numbers, loyalty card details, or personal addresses. This is your responsibility for protecting sensitive data.",
      "Focus only on the itemized grocery list. Skip the grand total, payment method, and store info—the app calculates totals for you.",
      "For very long receipts, simply fold the receipt into sections that fit your camera view and take a photo of each part. You can add as many photos as needed for one receipt.",
      "Use the 'Camera' button for live capture or 'Upload' for existing photos.",
      "Click 'Process All Photos' when you've added all sections of the receipt."
    ],
    highlight: {
        icon: Shield,
        title: "Protect Your Privacy First",
        content: "Always fold, cover, or cross out credit card numbers, full addresses, and other sensitive personal information on your receipts before scanning. The app only needs to see the grocery items and prices to function properly."
    }
  },
  {
    icon: Edit,
    title: "Review and Validate",
    description: "After processing, the AI presents the extracted items for your review. This validation step is crucial for ensuring your data is perfectly accurate.",
    details: [
      "Quickly correct any item names, prices, or quantities the AI may have misread.",
      "Re-assign items to different categories if needed.",
      "Add or verify the supermarket and purchase date.",
      "Once everything looks correct, click 'Save Receipt' to add it to your permanent history."
    ]
  },
  {
    icon: PiggyBank,
    title: "Set Your Smart Budget",
    description: "Visit the 'Budget' page to create budgets that match YOUR pay schedule. This gives you realistic insight into your spending habits.",
    details: [
      "Use 'Custom Monthly' to align your budget with your payday (e.g., from the 20th to the 19th of the next month). The dashboard will track days left until your next payday.",
      "Alternatively, use 'Weekly' or standard 'Monthly' (1st to 31st) budgets.",
      "Enter your total spending limit and set optional limits for specific categories.",
      "Get smart forecasting to see if you're on track to stay within your budget."
    ],
    highlight: {
        icon: Calendar,
        title: "Budgets That Match Your Pay Schedule",
        content: "Most people aren't paid on the 1st of the month. GroceryTrack™'s 'Custom Monthly' budget lets you set a period that aligns with when you actually receive your money, giving you a far more accurate picture of your spending habits within your pay cycle."
    }
  },
  {
    icon: TrendingUp,
    title: "Analyze Your Spending",
    description: "The 'Analytics' page provides powerful charts and comparison tools to help you understand your spending habits and track personal inflation.",
    details: [
      "View spending trends over time with interactive charts.",
      "See breakdowns by category and supermarket to identify where your money goes.",
      "Enable 'Comparison Mode' to compare any two time periods (e.g., this month vs. last month).",
      "Track your personal inflation to see how prices of items you buy have changed."
    ]
  }
];

export default function GuidePage() {
  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-4 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl shadow-lg mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">How to Use GroceryTrack™</h1>
          <p className="text-slate-600 mt-2">A complete guide to smart grocery expense tracking that fits YOUR lifestyle.</p>
        </motion.div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-4 p-6 bg-white/50">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-grow">
                    <CardTitle className="text-xl font-bold text-slate-900">{step.title}</CardTitle>
                    <p className="text-slate-600 mt-1">{step.description}</p>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  {step.highlight && (
                     <div className="mt-6 p-4 bg-emerald-50 border-l-4 border-emerald-400 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <step.highlight.icon className="w-6 h-6 text-emerald-600 mt-1"/>
                            <div>
                                <h4 className="font-bold text-emerald-900">{step.highlight.title}</h4>
                                <p className="text-sm text-emerald-800 mt-1">{step.highlight.content}</p>
                            </div>
                        </div>
                     </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-600" />
                Pro Tips for Better Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>• <strong>Privacy first:</strong> Always hide sensitive information (credit cards, addresses) before scanning</p>
              <p>• <strong>Good lighting:</strong> Scan receipts in bright, even lighting for best results</p>
              <p>• <strong>Flat surface:</strong> Place receipts on a flat surface, avoid wrinkles</p>
              <p>• <strong>Budget forecasting:</strong> Check your dashboard regularly to see spending predictions</p>
              <p>• <strong>Inflation tracking:</strong> Use Analytics to see how grocery prices affect your budget over time</p>
              <p>• <strong>Currency:</strong> Change your base currency in Settings</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
