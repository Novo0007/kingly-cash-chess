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
    <Card className="bg-card border border-border rounded-2xl">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-foreground flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <span className="text-base sm:text-lg">Admin Panel</span>
          </div>
          <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm rounded-full">
            {adminUser.role.replace("_", " ").toUpperCase()}
          </Badge>
        </CardTitle>
        <p className="text-muted-foreground text-sm sm:text-base">
          Welcome back, Administrator. Manage your platform from here.
        </p>
      </CardHeader>
    </Card>
  );
};
