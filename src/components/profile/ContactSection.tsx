import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Send,
  MapPin,
  Globe,
  Star,
  Bug,
  Lightbulb,
  Heart,
  AlertCircle,
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";

interface ContactSectionProps {
  onBack: () => void;
}

export const ContactSection = ({ onBack }: ContactSectionProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      value: "support@nncgames.com",
      description: "Get help via email",
      color: "from-blue-600 to-indigo-600",
      action: () => window.open("mailto:support@nncgames.com"),
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      value: "Available 24/7",
      description: "Instant chat support",
      color: "from-green-600 to-emerald-600",
      action: () => toast.info("Live chat will be available soon!"),
    },
    {
      icon: Phone,
      title: "Phone Support",
      value: "+91-XXXX-XXXXXX",
      description: "Call us for urgent issues",
      color: "from-purple-600 to-pink-600",
      action: () => toast.info("Phone support coming soon!"),
    },
  ];

  const categories = [
    { value: "bug", label: "🐛 Bug Report", icon: Bug },
    { value: "feature", label: "💡 Feature Request", icon: Lightbulb },
    { value: "account", label: "👤 Account Issue", icon: AlertCircle },
    { value: "payment", label: "💳 Payment Problem", icon: AlertCircle },
    { value: "feedback", label: "⭐ General Feedback", icon: Star },
    { value: "other", label: "❓ Other", icon: MessageCircle },
  ];

  const faqItems = [
    {
      question: "How do I reset my password?",
      answer:
        'Go to the login page and click "Forgot Password". Follow the instructions sent to your email.',
    },
    {
      question: "Why is my withdrawal taking long?",
      answer:
        "Withdrawals typically take 1-2 business days. Check your bank details and contact us if it takes longer.",
    },
    {
      question: "How do I report a cheater?",
      answer:
        "Use the report button during or after a game. Our anti-cheat team will investigate immediately.",
    },
    {
      question: "Can I change my username?",
      answer:
        "Yes! Go to your profile settings and click the edit button next to your username.",
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
          📞 Contact & Support
        </h1>
      </div>

      {/* Hero */}
      <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 border-2 border-cyan-400 shadow-xl">
        <CardContent className="p-6 md:p-8 text-center">
          <div className="space-y-4">
            <div className="text-4xl md:text-6xl">🤝</div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              We're Here to Help!
            </h2>
            <p className="text-cyan-100 text-sm md:text-base">
              Have a question, found a bug, or want to share feedback? Our
              friendly support team is ready to assist you 24/7.
            </p>
            <Badge className="bg-white/20 text-white border-white/30">
              <Clock className="h-4 w-4 mr-2" />
              Average response time: 2 hours
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contact Methods */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          📬 Get in Touch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {contactMethods.map((method, index) => (
            <Card
              key={index}
              className={`bg-gradient-to-br ${method.color} border-2 border-white/20 shadow-xl cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
              onClick={method.action}
            >
              <CardContent className="p-4 md:p-5 text-center">
                <method.icon className="h-8 w-8 md:h-10 md:w-10 text-white mx-auto mb-3" />
                <h3 className="text-white font-bold text-base md:text-lg mb-1">
                  {method.title}
                </h3>
                <p className="text-white/80 text-sm md:text-base font-medium mb-1">
                  {method.value}
                </p>
                <p className="text-white/60 text-xs md:text-sm">
                  {method.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact Form */}
      <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white font-black text-lg md:text-xl">
            ✉️ Send us a Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-white font-bold">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your full name"
                  className="bg-slate-600/50 border-slate-500 text-white placeholder:text-gray-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white font-bold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                  className="bg-slate-600/50 border-slate-500 text-white placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-white font-bold">
                Category
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {categories.map((category) => (
                  <Button
                    key={category.value}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleInputChange("category", category.value)
                    }
                    className={`justify-start text-xs p-2 h-auto ${
                      formData.category === category.value
                        ? "bg-blue-600 text-white"
                        : "bg-slate-600/50 text-gray-300 hover:bg-slate-600"
                    }`}
                  >
                    <category.icon className="h-3 w-3 mr-1" />
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="subject" className="text-white font-bold">
                Subject
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Brief description of your issue"
                className="bg-slate-600/50 border-slate-500 text-white placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-white font-bold">
                Message
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Please provide detailed information about your issue or feedback..."
                rows={4}
                className="bg-slate-600/50 border-slate-500 text-white placeholder:text-gray-400 resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* FAQ */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          ❓ Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 shadow-xl"
            >
              <CardContent className="p-4 md:p-5">
                <h3 className="text-white font-bold text-base md:text-lg mb-2">
                  {item.question}
                </h3>
                <p className="text-gray-300 text-sm md:text-base">
                  {item.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Office Info */}
      <Card className="bg-gradient-to-r from-gray-700 to-gray-800 border-2 border-gray-600 shadow-xl">
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <h3 className="text-white font-black text-lg md:text-xl">
              🏢 Our Office
            </h3>
            <div className="space-y-2 text-gray-300 text-sm md:text-base">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>NNC Games Headquarters</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Globe className="h-4 w-4" />
                <span>www.nncgames.com</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Support available 24/7</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs">
              Made with <Heart className="h-3 w-3 inline text-red-400" /> for
              our gaming community
            </p>
          </div>
        </CardContent>
      </Card>
    </MobileContainer>
  );
};
