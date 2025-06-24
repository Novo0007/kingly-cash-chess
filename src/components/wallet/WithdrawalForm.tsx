
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, User, Phone, Wallet, AlertTriangle } from 'lucide-react';

interface WithdrawalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onWithdraw: (withdrawalData: any) => void;
}

export const WithdrawalForm = ({ open, onOpenChange, amount, onWithdraw }: WithdrawalFormProps) => {
  const [formData, setFormData] = useState({
    accountType: 'bank',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  const withdrawalAmount = amount;
  const feePercentage = 20;
  const fee = Math.round(amount * (feePercentage / 100)); // 20% fee
  const finalAmount = withdrawalAmount - fee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.accountType === 'bank') {
      if (!formData.accountName || !formData.accountNumber || !formData.ifscCode) {
        return;
      }
    } else {
      if (!formData.upiId) {
        return;
      }
    }

    onWithdraw({
      ...formData,
      originalAmount: withdrawalAmount,
      fee: fee,
      finalAmount: finalAmount
    });

    // Reset form
    setFormData({
      accountType: 'bank',
      accountName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 border-2 border-blue-500/50 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-3 text-blue-300 text-2xl font-bold">
            <Wallet className="h-7 w-7" />
            💰 Withdraw Funds
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          {/* Amount Summary */}
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 border-slate-600/50 backdrop-blur-sm">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between text-white text-lg">
                <span className="flex items-center gap-2">
                  💸 Withdrawal Amount:
                </span>
                <span className="font-bold">₹{withdrawalAmount}</span>
              </div>
              <div className="flex justify-between text-red-300 text-lg">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Processing Fee ({feePercentage}%):
                </span>
                <span className="font-bold">-₹{fee}</span>
              </div>
              <div className="border-t border-slate-600/50 pt-3 flex justify-between text-green-300">
                <span className="font-bold text-lg">✅ You'll Receive:</span>
                <span className="font-bold text-2xl">₹{finalAmount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Type Selection */}
          <div className="space-y-4">
            <Label className="text-blue-300 font-bold text-lg">🏦 Select Account Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'bank' })}
                className={`${formData.accountType === 'bank' 
                  ? 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-400 shadow-lg' 
                  : 'bg-gray-700 hover:bg-gray-600 border border-gray-500'
                } font-bold py-4 rounded-xl text-base transition-all`}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                🏦 Bank Account
              </Button>
              <Button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'upi' })}
                className={`${formData.accountType === 'upi' 
                  ? 'bg-purple-600 hover:bg-purple-700 border-2 border-purple-400 shadow-lg' 
                  : 'bg-gray-700 hover:bg-gray-600 border border-gray-500'
                } font-bold py-4 rounded-xl text-base transition-all`}
              >
                <Phone className="h-5 w-5 mr-2" />
                📱 UPI ID
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          {formData.accountType === 'bank' ? (
            <div className="space-y-5">
              <div>
                <Label htmlFor="accountName" className="text-white font-bold text-base mb-2 block">
                  👤 Account Holder Name
                </Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="Enter full name as per bank records"
                  className="bg-slate-800/50 border-slate-600 text-white font-medium text-base py-3 px-4 rounded-xl focus:border-blue-400 transition-colors"
                  required
                />
              </div>
              <div>
                <Label htmlFor="accountNumber" className="text-white font-bold text-base mb-2 block">
                  🔢 Account Number
                </Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Enter your bank account number"
                  className="bg-slate-800/50 border-slate-600 text-white font-medium text-base py-3 px-4 rounded-xl focus:border-blue-400 transition-colors"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ifscCode" className="text-white font-bold text-base mb-2 block">
                  🏪 IFSC Code
                </Label>
                <Input
                  id="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="Enter bank IFSC code (e.g., SBIN0000123)"
                  className="bg-slate-800/50 border-slate-600 text-white font-medium text-base py-3 px-4 rounded-xl focus:border-blue-400 transition-colors"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="upiId" className="text-white font-bold text-base mb-2 block">
                📱 UPI ID
              </Label>
              <Input
                id="upiId"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="Enter UPI ID (e.g., yourname@paytm, yourname@googlepay)"
                className="bg-slate-800/50 border-slate-600 text-white font-medium text-base py-3 px-4 rounded-xl focus:border-purple-400 transition-colors"
                required
              />
              <p className="text-sm text-gray-400 mt-2">
                💡 Common UPI formats: @paytm, @googlepay, @phonepe, @ybl
              </p>
            </div>
          )}

          {/* Important Notice */}
          <Card className="bg-yellow-500/10 border border-yellow-500/30">
            <CardContent className="p-4">
              <p className="text-yellow-300 text-sm font-medium flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Important:</strong> Withdrawals are processed within 1-3 business days. 
                  A {feePercentage}% processing fee is deducted from your withdrawal amount. 
                  Please ensure your account details are correct to avoid delays.
                </span>
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 font-bold text-lg py-4 rounded-xl border-2 border-gray-500 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              ❌ Cancel
            </Button>
            <Button
              type="submit"
              disabled={finalAmount <= 0}
              className="flex-1 font-bold text-lg py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✅ Confirm Withdrawal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
