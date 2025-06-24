import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, ArrowUpRight, ArrowDownLeft, History, DollarSign, RefreshCw } from 'lucide-react';
import { WithdrawalForm } from './WithdrawalForm';
import type { Tables } from '@/integrations/supabase/types';

export const WalletManager = () => {
  const [wallet, setWallet] = useState<Tables<'wallets'> | null>(null);
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawalForm, setWithdrawalForm] = useState<{open: boolean, amount: number}>({
    open: false,
    amount: 0
  });

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
      // Initialize Razorpay
      const options = {
        key: 'rzp_test_1234567890', // Replace with your Razorpay key
        amount: depositAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'Chess Game',
        description: `Deposit ₹${depositAmount} to wallet`,
        handler: async function (response: any) {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Create transaction record
            const { error } = await supabase
              .from('transactions')
              .insert({
                user_id: user.id,
                transaction_type: 'deposit',
                amount: depositAmount,
                status: 'completed',
                description: `Razorpay deposit of ₹${depositAmount}`,
                razorpay_payment_id: response.razorpay_payment_id
              });

            if (error) throw error;

            // Update wallet balance
            const { error: walletError } = await supabase.rpc('increment_decimal', {
              table_name: 'wallets',
              row_id: user.id,
              column_name: 'balance',
              increment_value: depositAmount
            });

            if (walletError) throw walletError;

            toast.success('💰 Deposit successful!');
            setAmount('');
            fetchWallet();
            fetchTransactions();
          } catch (error) {
            console.error('Payment confirmation error:', error);
            toast.error('Payment confirmation failed');
          }
        },
        prefill: {
          name: 'Player',
          email: 'player@example.com'
        },
        theme: {
          color: '#F59E0B'
        }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay error:', error);
      toast.error('Payment initialization failed');
    }

    setLoading(false);
  };

  const handleWithdrawClick = () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!wallet || wallet.balance < withdrawAmount) {
      toast.error('Insufficient balance');
      return;
    }

    setWithdrawalForm({
      open: true,
      amount: withdrawAmount
    });
  };

  const handleWithdrawalSubmit = async (withdrawalData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'withdrawal',
          amount: withdrawalData.finalAmount,
          status: 'pending',
          description: `Withdrawal to ${withdrawalData.accountType === 'bank' ? 'Bank Account' : 'UPI'}: ${withdrawalData.accountType === 'bank' ? withdrawalData.accountNumber : withdrawalData.upiId}`,
        });

      if (error) throw error;

      // Update wallet balance
      const { error: walletError } = await supabase.rpc('increment_decimal', {
        table_name: 'wallets',
        row_id: user.id,
        column_name: 'balance',
        increment_value: -withdrawalData.originalAmount
      });

      if (walletError) throw walletError;

      toast.success('🏦 Withdrawal request submitted!');
      setAmount('');
      setWithdrawalForm({ open: false, amount: 0 });
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Withdrawal failed');
    }
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
      <WithdrawalForm
        open={withdrawalForm.open}
        onOpenChange={(open) => setWithdrawalForm(prev => ({ ...prev, open }))}
        amount={withdrawalForm.amount}
        onWithdraw={handleWithdrawalSubmit}
      />

      {/* Wallet Balance */}
      <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              💰 Wallet Balance
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
              🔒 Locked: ₹{wallet.locked_balance.toFixed(2)}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Deposit/Withdraw */}
      <Card className="bg-black/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white">💳 Add or Withdraw Funds</CardTitle>
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
              💰 Deposit (Razorpay)
            </Button>
            <Button
              onClick={handleWithdrawClick}
              disabled={loading}
              variant="outline"
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <ArrowUpRight className="h-4 w-4 mr-2" />
              🏦 Withdraw (-20%)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="bg-black/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5" />
            📊 Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-4">📭 No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
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

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};
