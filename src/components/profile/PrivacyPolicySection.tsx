import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";

interface PrivacyPolicySectionProps {
  onBack: () => void;
}

export const PrivacyPolicySection = ({ onBack }: PrivacyPolicySectionProps) => {
  const sections = [
    {
      title: "📊 Information We Collect",
      icon: Database,
      content: [
        "Account information (username, email, profile details)",
        "Game statistics and performance data",
        "Transaction history for wallet operations",
        "Device information and usage analytics",
        "Communication and chat messages (for moderation)",
      ],
    },
    {
      title: "🔧 How We Use Your Information",
      icon: UserCheck,
      content: [
        "Provide and improve our gaming services",
        "Process transactions and manage your wallet",
        "Ensure fair play and prevent cheating",
        "Send important updates and notifications",
        "Analyze usage to enhance user experience",
      ],
    },
    {
      title: "🔒 Data Protection",
      icon: Lock,
      content: [
        "All data is encrypted using industry-standard protocols",
        "Payment information is processed securely",
        "Limited access to personal data by authorized personnel only",
        "Regular security audits and updates",
        "Secure data centers with 24/7 monitoring",
      ],
    },
    {
      title: "👥 Information Sharing",
      icon: Eye,
      content: [
        "We never sell your personal information to third parties",
        "Limited sharing with service providers (payment processors)",
        "Anonymous analytics may be shared for research",
        "Legal compliance when required by law",
        "Tournament results may be publicly displayed",
      ],
    },
  ];

  const rights = [
    {
      title: "Access Your Data",
      description: "Request a copy of your personal information",
    },
    {
      title: "Update Information",
      description: "Modify or correct your personal details",
    },
    {
      title: "Delete Account",
      description: "Request deletion of your account and data",
    },
    {
      title: "Data Portability",
      description: "Export your data to another service",
    },
    {
      title: "Opt-out",
      description: "Unsubscribe from marketing communications",
    },
  ];

  return (
    <MobileContainer className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          🔒 Privacy Policy
        </h1>
      </div>

      {/* Introduction */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-400 shadow-xl">
        <CardContent className="p-6 md:p-8">
          <div className="text-center space-y-4">
            <div className="text-4xl md:text-6xl">🛡️</div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Your Privacy Matters
            </h2>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed">
              At NNC Games, we take your privacy seriously. This policy explains
              how we collect, use, and protect your personal information when
              you use our gaming platform.
            </p>
            <p className="text-xs md:text-sm text-blue-200">
              Last updated: December 2024
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Sections */}
      {sections.map((section, index) => (
        <Card
          key={index}
          className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 shadow-xl"
        >
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 font-black text-lg md:text-xl">
              <section.icon className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 md:space-y-3">
              {section.content.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2 md:gap-3">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300 text-sm md:text-base">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      {/* Your Rights */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-2 border-green-400 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3 font-black text-lg md:text-xl">
            <UserCheck className="h-5 w-5 md:h-6 md:w-6" />
            ⚖️ Your Rights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-100 text-sm md:text-base mb-4">
            You have the following rights regarding your personal data:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rights.map((right, index) => (
              <div key={index} className="bg-white/10 rounded-lg p-3 md:p-4">
                <h4 className="text-white font-bold text-sm md:text-base mb-1">
                  {right.title}
                </h4>
                <p className="text-green-200 text-xs md:text-sm">
                  {right.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card className="bg-gradient-to-r from-orange-600 to-red-600 border-2 border-orange-400 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3 font-black text-lg md:text-xl">
            <AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />⏰ Data Retention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-orange-100 text-sm md:text-base">
              We retain your personal information only as long as necessary to
              provide our services:
            </p>
            <ul className="space-y-2 text-orange-200 text-sm md:text-base">
              <li>• Account data: Until account deletion</li>
              <li>• Game statistics: 3 years after last activity</li>
              <li>• Transaction records: 7 years (legal requirement)</li>
              <li>• Chat messages: 30 days for moderation</li>
              <li>• Analytics data: 2 years (anonymized)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Cookies */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3 font-black text-lg md:text-xl">
            <Database className="h-5 w-5 md:h-6 md:w-6" />
            🍪 Cookies & Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-purple-100 text-sm md:text-base">
              We use cookies and similar technologies to:
            </p>
            <ul className="space-y-1 text-purple-200 text-sm md:text-base">
              <li>• Keep you logged in to your account</li>
              <li>• Remember your preferences and settings</li>
              <li>• Analyze how you use our platform</li>
              <li>• Prevent fraud and ensure security</li>
            </ul>
            <p className="text-purple-200 text-xs md:text-sm">
              You can control cookies through your browser settings.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-gradient-to-r from-gray-700 to-gray-800 border-2 border-gray-600 shadow-xl">
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <h3 className="text-white font-black text-lg md:text-xl">
              📧 Questions About Privacy?
            </h3>
            <p className="text-gray-300 text-sm md:text-base">
              If you have any questions about this privacy policy or how we
              handle your data, please don't hesitate to contact us.
            </p>
            <div className="space-y-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Contact Privacy Team
              </Button>
              <p className="text-gray-400 text-xs">
                Email: mynameisjyotirmoy@gmail.com 
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </MobileContainer>
  );
};
