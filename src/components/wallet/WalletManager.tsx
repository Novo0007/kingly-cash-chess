
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, ArrowUpRight, ArrowDownLeft, History, DollarSign, RefreshCw } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

export const WalletManager = () => {
  const [wallet, setWallet] = useState<Tables<'wallets'> | null>(null);
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();

    // Auto-refresh every 10 seconds to catch game winnings
    const autoRefreshInterval = setInterval(() => {
      fetchWallet();
      fetchTransactions();
    }, 10000);

    // Subscribe to real-time changes for wallet and transactions
    const walletSubscription = supabase
      .channel('wallet_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'wallets'
        },
        () => {
          console.log('Wallet updated, refreshing...');
          fetchWallet();
        }
      )
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'transactions'
        },
        () => {
          console.log('New transaction, refreshing...');
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      clearInterval(autoRefreshInterval);
      supabase.removeChannel(walletSubscription);
    };
  }, []);

  const fetchWallet = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching wallet:', error);
    } else {
      setWallet(data);
    }
  };

  const fetchTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching transactions:', error);
    } else {
      setTransactions(data || []);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchWallet(), fetchTransactions()]);
    setRefreshing(false);
    toast.success('Wallet data refreshed!');
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    
    try {
      // Create Razorpay order (this would normally be done via your backend)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For demo purposes, we'll simulate a successful payment
      // In production, integrate with Razorpay properly
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'deposit',
          amount: depositAmount,
          status: 'completed',
          description: `Deposit of ₹${depositAmount}`,
        });

      if (error) throw error;

      // Update wallet balance using the new function
      const { error: walletError } = await supabase.rpc('increment_decimal', {
        table_name: 'wallets',
        row_id: user.id,
        column_name: 'balance',
        increment_value: depositAmount
      });

      if (walletError) throw walletError;

      toast.success('Deposit successful!');
      setAmount('');
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      console.error('Deposit error:', error);
      toast.error('Deposit failed');
    }

    setLoading(false);
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!wallet || wallet.balance < withdrawAmount) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'withdrawal',
          amount: withdrawAmount,
          status: 'pending',
          description: `Withdrawal of ₹${withdrawAmount}`,
        });

      if (error) throw error;

      // Update wallet balance using the new function (negative amount for withdrawal)
      const { error: walletError } = await supabase.rpc('increment_decimal', {
        table_name: 'wallets',
        row_id: user.id,
        column_name: 'balance',
        increment_value: -withdrawAmount
      });

      if (walletError) throw walletError;

      toast.success('Withdrawal request submitted!');
      setAmount('');
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Withdrawal failed');
    }

    setLoading(false);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'game_winning':
        return <CreditCard className="h-4 w-4 text-yellow-500" />;
      case 'game_entry':
        return <DollarSign className="h-4 w-4 text-blue-500" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTransactionSign = (type: string) => {
    return ['withdrawal', 'game_entry'].includes(type) ? '-' : '+';
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Wallet Balance
            </div>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              disabled={refreshing}
              className="text-yellow-500 hover:bg-yellow-500/10"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-500">
            ₹{wallet?.balance?.toFixed(2) || '0.00'}
          </div>
          {wallet?.locked_balance && wallet.locked_balance > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              Locked: ₹{wallet.locked_balance.toFixed(2)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Deposit/Withdraw */}
      <Card className="bg-black/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white">Add or Withdraw Funds</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="bg-gray-800/50 border-gray-600 text-white"
          />
          <div className="flex gap-3">
            <Button
              onClick={handleDeposit}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <ArrowDownLeft className="h-4 w-4 mr-2" />
              Deposit
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={loading}
              variant="outline"
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-black/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <p className="text-white font-medium capitalize">
                        {transaction.transaction_type.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {getTransactionSign(transaction.transaction_type)}
                      ₹{transaction.amount.toFixed(2)}
                    </p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
