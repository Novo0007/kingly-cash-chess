import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  UserCheck,
  AlertTriangle,
  Mail,
  Clock,
} from "lucide-react";

export const PrivacyPolicy = () => {
  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-white">
            Privacy Policy
          </CardTitle>
          <p className="text-slate-400 text-sm">Last updated: December 2024</p>
        </CardHeader>
      </Card>

      {/* Introduction */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-blue-400" />
            Our Commitment to Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">
            At NNC Games, we are committed to protecting your privacy and
            ensuring the security of your personal information. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            information when you use our gaming platform.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-blue-300 text-sm font-medium">
              🔒 Your privacy is our priority. We never sell your personal data
              to third parties.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Information We Collect */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-green-400" />
            Information We Collect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">
              Personal Information
            </h4>
            <ul className="space-y-2 text-slate-300 text-sm pl-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                Account information (username, email, profile details)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                Payment information (for secure transactions)
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                Communication data (chat messages, support tickets)
              </li>
            </ul>
          </div>

          <Separator className="bg-slate-600/50" />

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Game Data</h4>
            <ul className="space-y-2 text-slate-300 text-sm pl-4">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                Game statistics and performance metrics
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                Match history and tournament participation
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                Device information and technical data
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* How We Use Information */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5 text-purple-400" />
            How We Use Your Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <h4 className="text-white font-semibold text-sm mb-2">
                Service Delivery
              </h4>
              <p className="text-slate-400 text-xs">
                Providing and maintaining our gaming services, processing
                payments, and ensuring fair gameplay.
              </p>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <h4 className="text-white font-semibold text-sm mb-2">
                Communication
              </h4>
              <p className="text-slate-400 text-xs">
                Sending important updates, responding to support requests, and
                notifying about game events.
              </p>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <h4 className="text-white font-semibold text-sm mb-2">
                Security
              </h4>
              <p className="text-slate-400 text-xs">
                Detecting fraud, preventing abuse, and maintaining platform
                security and integrity.
              </p>
            </div>
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <h4 className="text-white font-semibold text-sm mb-2">
                Improvement
              </h4>
              <p className="text-slate-400 text-xs">
                Analyzing usage patterns to improve our services and develop new
                features.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Protection */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-yellow-400" />
            Data Protection & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">
            We implement industry-standard security measures to protect your
            personal information:
          </p>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-400" />
              End-to-end encryption for sensitive data
            </li>
            <li className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-blue-400" />
              Secure payment processing with certified providers
            </li>
            <li className="flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-400" />
              Regular security audits and vulnerability assessments
            </li>
            <li className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-yellow-400" />
              Access controls and employee training programs
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-cyan-400" />
            Data Sharing & Third Parties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-red-300 font-semibold text-sm">
                Important Notice
              </span>
            </div>
            <p className="text-red-300 text-sm">
              We do not sell, trade, or rent your personal information to third
              parties.
            </p>
          </div>
          <p className="text-slate-300 text-sm">
            We may share limited information only in these specific
            circumstances:
          </p>
          <ul className="space-y-1 text-slate-400 text-sm pl-4">
            <li>• With your explicit consent</li>
            <li>• To comply with legal obligations</li>
            <li>• To protect our rights and prevent fraud</li>
            <li>• With trusted service providers (under strict agreements)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Your Rights */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <UserCheck className="h-5 w-5 text-green-400" />
            Your Rights & Choices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-slate-300 text-sm">You have the right to:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Eye className="h-4 w-4 text-blue-400" />
              Access your personal data
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <UserCheck className="h-4 w-4 text-green-400" />
              Correct inaccurate information
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-400" />
              Delete your account
            </div>
            <div className="flex items-center gap-2 text-slate-300 text-sm">
              <Database className="h-4 w-4 text-purple-400" />
              Download your data
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Updates */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-blue-400" />
            Contact & Policy Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3">
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">
                Privacy Questions?
              </h4>
              <p className="text-slate-300 text-sm">
                Contact our privacy team at privacy@nncgames.com for any
                questions about this policy or your data rights.
              </p>
            </div>
            <Separator className="bg-slate-600/50" />
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-yellow-400 mt-1" />
              <div>
                <h4 className="text-white font-semibold text-sm">
                  Policy Updates
                </h4>
                <p className="text-slate-400 text-sm">
                  We may update this policy periodically. We'll notify you of
                  significant changes via email or platform notifications.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600">
        <CardContent className="text-center py-4">
          <p className="text-slate-400 text-sm">
            By using NNC Games, you acknowledge that you have read and
            understood this Privacy Policy.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            © 2024 NNC Games. All rights reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
