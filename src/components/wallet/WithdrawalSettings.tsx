import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";

interface WithdrawalSettings {
  id: string;
  withdrawal_enabled: boolean;
  admin_controlled: boolean;
  created_at: string;
  updated_at: string;
}

export const WithdrawalSettings: React.FC = () => {
  const [settings, setSettings] = useState<WithdrawalSettings | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
    fetchSettings();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { data } = await supabase.rpc('is_admin', { user_email: user.email });
      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        // If no settings exist, create default ones
        const { data: newSettings, error: createError } = await supabase
          .from('withdrawal_settings')
          .insert({
            withdrawal_enabled: true,
            admin_controlled: false
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating settings:', createError);
          return;
        }
        setSettings(newSettings);
      } else if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching withdrawal settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<WithdrawalSettings>) => {
    if (!settings) return;

    try {
      const { data, error } = await supabase
        .from('withdrawal_settings')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update withdrawal settings",
          variant: "destructive",
        });
        return;
      }

      setSettings(data);
      toast({
        title: "Success",
        description: "Withdrawal settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update withdrawal settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading withdrawal settings...</div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return null; // Only show to admins
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Withdrawal Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="withdrawal-enabled" className="flex items-center gap-2">
            {settings?.withdrawal_enabled ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            Enable Withdrawal Button
          </Label>
          <Switch
            id="withdrawal-enabled"
            checked={settings?.withdrawal_enabled || false}
            onCheckedChange={(checked) => 
              updateSettings({ withdrawal_enabled: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="admin-controlled">
            Admin Control Required
          </Label>
          <Switch
            id="admin-controlled"
            checked={settings?.admin_controlled || false}
            onCheckedChange={(checked) => 
              updateSettings({ admin_controlled: checked })
            }
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <p>• When enabled, users can see and use the withdrawal button</p>
          <p>• Admin control requires admin approval for all withdrawals</p>
          <p>• These settings affect the entire application</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSettings;