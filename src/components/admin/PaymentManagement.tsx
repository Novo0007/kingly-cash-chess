import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CreditCard,
  CheckCircle,
  X,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

interface PaymentManagementProps {
  adminUser: Tables<"admin_users">;
}

type Transaction = Tables<"transactions"> & {
  profiles: {
    username: string;
    full_name: string | null;
  } | null;
};

export const PaymentManagement = ({ adminUser }: PaymentManagementProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "failed">("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          profiles (
            username,
            full_name
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Handle the case where profiles might be null or have errors
      const processedData = (data || []).map(transaction => {
        // Safely check if profiles exists and has the expected properties
        const rawProfiles = transaction.profiles as any;
        
        if (rawProfiles && 
            typeof rawProfiles === 'object' && 
            !Array.isArray(rawProfiles) &&
            typeof rawProfiles.username === 'string') {
          return {
            ...transaction,
            profiles: {
              username: rawProfiles.username,
              full_name: rawProfiles.full_name || null
            }
          };
        }
        
        return {
          ...transaction,
          profiles: null
        };
      });
      
      setTransactions(processedData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId: string, status: "completed" | "failed") => {
    try {
      const { error } = await supabase
        .from("transactions")
        .update({ status })
        .eq("id", transactionId);

      if (error) throw error;
      
      toast.success(`Transaction ${status} successfully`);
      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white";
      case "pending":
        return "bg-yellow-600 text-white";
      case "failed":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="h-4 w-4 text-green-400" />;
      case "withdrawal":
        return <ArrowUpCircle className="h-4 w-4 text-red-400" />;
      default:
        return <CreditCard className="h-4 w-4 text-blue-400" />;
    }
  };

  const filteredTransactions = transactions.filter(transaction => 
    filter === "all" || transaction.status === filter
  );

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const completedAmount = filteredTransactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-600">
        <CardContent className="p-6 text-center">
          <div className="w-8 h-8 border-3 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-900/20 border-green-600/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-green-300 text-sm">Total Amount</p>
                <p className="text-white font-bold text-lg">₹{totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/20 border-blue-600/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-blue-300 text-sm">Completed</p>
                <p className="text-white font-bold text-lg">₹{completedAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-900/20 border-purple-600/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-purple-300 text-sm">Transactions</p>
                <p className="text-white font-bold text-lg">{filteredTransactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-400" />
            Payment Management
          </CardTitle>
          <div className="flex gap-2">
            {(["all", "pending", "completed", "failed"] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                className={filter === status ? "bg-green-600" : "text-slate-300 border-slate-600"}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="bg-slate-700 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(transaction.transaction_type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">
                            {transaction.profiles?.username || "Unknown User"}
                          </span>
                          <Badge className={getStatusColor(transaction.status || "pending")}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {transaction.transaction_type.toUpperCase()} • 
                          {new Date(transaction.created_at || '').toLocaleDateString()}
                        </p>
                        <p className="text-slate-300 text-sm">
                          {transaction.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">
                          ₹{Number(transaction.amount).toFixed(2)}
                        </p>
                        {transaction.razorpay_payment_id && (
                          <p className="text-slate-400 text-xs">
                            {transaction.razorpay_payment_id}
                          </p>
                        )}
                      </div>

                      {transaction.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateTransactionStatus(transaction.id, "completed")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateTransactionStatus(transaction.id, "failed")}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
