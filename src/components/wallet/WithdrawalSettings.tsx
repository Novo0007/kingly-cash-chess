import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export const WithdrawalSettings: React.FC = () => {
  const [withdrawalEnabled, setWithdrawalEnabled] = useState(false);
  const isAdmin = true; // Placeholder - will be properly implemented when database types are updated

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Enable Withdrawals</h3>
              <p className="text-xs text-muted-foreground">
                Allow users to withdraw funds from their wallets
              </p>
            </div>
            <Switch
              checked={withdrawalEnabled}
              onCheckedChange={setWithdrawalEnabled}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
            ⚠️ Note: Withdrawal settings are temporarily disabled while database types are being updated.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};