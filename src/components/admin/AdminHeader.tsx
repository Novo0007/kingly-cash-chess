
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type AdminUser = Tables<"admin_users">;

interface AdminHeaderProps {
  adminUser: AdminUser;
}

export const AdminHeader = ({ adminUser }: AdminHeaderProps) => {
  return (
    <Card className="wood-card wood-plank border-amber-700">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-amber-900 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 font-heading">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-amber-700" />
            <span className="text-base sm:text-lg">Admin Lodge</span>
          </div>
          <Badge className="bg-amber-700 text-amber-50 text-xs sm:text-sm">
            {adminUser.role.replace("_", " ").toUpperCase()}
          </Badge>
        </CardTitle>
        <p className="text-amber-800 text-sm sm:text-base">
          Welcome back, Administrator. Manage your gaming lodge from here.
        </p>
      </CardHeader>
    </Card>
  );
};
