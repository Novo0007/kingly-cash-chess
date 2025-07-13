import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ProfessionalCardDemo: React.FC = () => {
  const backgrounds = [
    { name: "White Background", bg: "bg-white", color: "#ffffff" },
    { name: "Light Gray", bg: "bg-gray-100", color: "#f3f4f6" },
    { name: "Medium Gray", bg: "bg-gray-500", color: "#6b7280" },
    { name: "Dark Gray", bg: "bg-gray-800", color: "#1f2937" },
    { name: "Black Background", bg: "bg-black", color: "#000000" },
    { name: "Blue Background", bg: "bg-blue-600", color: "#2563eb" },
    { name: "Green Background", bg: "bg-green-600", color: "#16a34a" },
    { name: "Purple Background", bg: "bg-purple-600", color: "#9333ea" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-professional-primary">
          Dynamic Text Color Demo
        </h2>
        <p className="text-professional-secondary">
          Text automatically adapts to background colors for optimal readability
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {backgrounds.map((item) => (
          <Card key={item.name} className={`professional-card ${item.bg}`}>
            <CardHeader>
              <CardTitle className="text-professional-primary">
                {item.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-professional-primary">
                Primary text automatically adjusts for contrast
              </p>
              <p className="text-professional-secondary">
                Secondary text maintains readability
              </p>
              <p className="text-professional-muted">
                Muted text for less important information
              </p>
              <Button className="professional-button size-sm bg-blue-600 text-white hover:bg-blue-700">
                Button Example
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProfessionalCardDemo;
