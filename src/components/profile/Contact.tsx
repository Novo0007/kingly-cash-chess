import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import {
  Mail,
  MessageSquare,
  Phone,
  Clock,
  MapPin,
  Send,
  Headphones,
  Bug,
  DollarSign,
  Shield,
  Users,
  Globe,
  Zap,
  AlertCircle,
} from "lucide-react";

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success(
      "Support ticket submitted! We'll get back to you within 24 hours.",
    );
    setFormData({
      name: "",
      email: "",
      category: "",
      subject: "",
      message: "",
    });
  };

  const supportCategories = [
    {
      id: "technical",
      label: "Technical Issues",
      icon: Bug,
      color: "text-red-400",
    },
    {
      id: "payment",
      label: "Payment & Billing",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      id: "account",
      label: "Account Issues",
      icon: Shield,
      color: "text-blue-400",
    },
    {
      id: "gameplay",
      label: "Gameplay Support",
      icon: Users,
      color: "text-purple-400",
    },
    {
      id: "general",
      label: "General Inquiry",
      icon: MessageSquare,
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Headphones className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-white">
            Contact Support
          </CardTitle>
          <p className="text-slate-400 text-sm">
            We're here to help! Get in touch with our support team.
          </p>
        </CardHeader>
      </Card>

      {/* Quick Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/80 border border-blue-600/30">
          <CardContent className="text-center py-4">
            <Mail className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold text-sm mb-1">
              Email Support
            </h3>
            <p className="text-slate-400 text-xs">support@nncgames.com</p>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mt-2 text-xs">
              24h Response
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/80 border border-green-600/30">
          <CardContent className="text-center py-4">
            <MessageSquare className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold text-sm mb-1">Live Chat</h3>
            <p className="text-slate-400 text-xs">Available 24/7</p>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-2 text-xs">
              Instant
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/80 border border-purple-600/30">
          <CardContent className="text-center py-4">
            <Clock className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold text-sm mb-1">
              Response Time
            </h3>
            <p className="text-slate-400 text-xs">Within 2-24 hours</p>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mt-2 text-xs">
              Guaranteed
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Support Categories */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            How Can We Help You?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {supportCategories.map((category) => (
              <div
                key={category.id}
                className={`p-3 bg-slate-700/30 rounded-lg border-l-4 border-l-slate-600 hover:border-l-blue-500 transition-colors cursor-pointer ${
                  formData.category === category.id
                    ? "bg-blue-500/10 border-l-blue-500"
                    : ""
                }`}
                onClick={() =>
                  setFormData({ ...formData, category: category.id })
                }
              >
                <div className="flex items-center gap-3">
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                  <div>
                    <h4 className="text-white font-semibold text-sm">
                      {category.label}
                    </h4>
                    <p className="text-slate-400 text-xs">
                      {category.id === "technical" &&
                        "Bug reports, connection issues, app crashes"}
                      {category.id === "payment" &&
                        "Payment failures, billing questions, refunds"}
                      {category.id === "account" &&
                        "Login issues, profile problems, security"}
                      {category.id === "gameplay" &&
                        "Game rules, fair play, tournament issues"}
                      {category.id === "general" &&
                        "Questions about features and services"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-green-400" />
            Send Us a Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-white text-sm">
                  Full Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600 text-white mt-1"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white text-sm">
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-slate-700/50 border-slate-600 text-white mt-1"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject" className="text-white text-sm">
                Subject
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600 text-white mt-1"
                placeholder="Brief description of your issue"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-white text-sm">
                Message *
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                className="bg-slate-700/50 border-slate-600 text-white mt-1 min-h-[100px]"
                placeholder="Please describe your issue or question in detail..."
                required
              />
            </div>

            {formData.category && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm">
                  Category:{" "}
                  <span className="font-semibold">
                    {
                      supportCategories.find(
                        (cat) => cat.id === formData.category,
                      )?.label
                    }
                  </span>
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="bg-slate-800/80 border border-red-600/30">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Urgent Issues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-slate-300 text-sm">
            For urgent security issues, payment problems, or account
            compromises:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-red-400" />
              <span className="text-white text-sm">urgent@nncgames.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-red-400" />
              <span className="text-white text-sm">+1 (555) 123-4567</span>
            </div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-300 text-sm">
              ⚠️ Emergency line available 24/7 for security and payment issues
              only.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Link */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardContent className="text-center py-4">
          <h3 className="text-white font-semibold mb-2">
            Looking for Quick Answers?
          </h3>
          <p className="text-slate-400 text-sm mb-3">
            Check out our comprehensive User Guide for common questions and
            tutorials.
          </p>
          <Button
            variant="outline"
            className="border-blue-600 text-blue-400 hover:bg-blue-500/10"
            onClick={() => toast.info("User Guide coming soon!")}
          >
            <Globe className="h-4 w-4 mr-2" />
            View User Guide
          </Button>
        </CardContent>
      </Card>

      {/* Office Information */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-400" />
            Our Office
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-white font-semibold text-sm">
              NNC Games Headquarters
            </p>
            <div className="text-slate-300 text-sm space-y-1">
              <p>123 Gaming Street, Suite 400</p>
              <p>Tech City, TC 12345</p>
              <p>United States</p>
            </div>
          </div>
          <Separator className="bg-slate-600/50" />
          <div className="grid grid-cols-2 gap-4 text-slate-300 text-sm">
            <div>
              <span className="text-slate-400">Business Hours:</span>
              <p>Mon-Fri: 9 AM - 6 PM PST</p>
            </div>
            <div>
              <span className="text-slate-400">Support Hours:</span>
              <p>24/7 Online Support</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600">
        <CardContent className="text-center py-4">
          <p className="text-slate-400 text-sm">
            We value your feedback and are committed to providing excellent
            customer support.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Average response time: 2-4 hours during business hours
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
