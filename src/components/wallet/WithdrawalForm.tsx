
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, User, Phone, Wallet } from 'lucide-react';

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
  const fee = Math.round(amount * 0.20); // 20% fee
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
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-500 shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-3 text-yellow-400 text-2xl font-bold">
            <Wallet className="h-7 w-7" />
            💰 Withdraw Funds
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          {/* Amount Summary */}
          <Card className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-500/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-white">
                <span>💸 Withdrawal Amount:</span>
                <span className="font-bold">₹{withdrawalAmount}</span>
              </div>
              <div className="flex justify-between text-red-300">
                <span>📉 Processing Fee (20%):</span>
                <span className="font-bold">-₹{fee}</span>
              </div>
              <div className="border-t border-red-500/30 pt-2 flex justify-between text-green-300">
                <span className="font-bold">✅ You'll Receive:</span>
                <span className="font-bold text-xl">₹{finalAmount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Type Selection */}
          <div className="space-y-3">
            <Label className="text-yellow-400 font-bold">🏦 Select Account Type</Label>
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'bank' })}
                className={`flex-1 ${formData.accountType === 'bank' 
                  ? 'bg-blue-600 hover:bg-blue-700 border-2 border-blue-400' 
                  : 'bg-gray-700 hover:bg-gray-600 border border-gray-500'
                } font-bold py-3 rounded-xl`}
              >
                <CreditCard className="h-5 w-5 mr-2" />
                🏦 Bank Account
              </Button>
              <Button
                type="button"
                onClick={() => setFormData({ ...formData, accountType: 'upi' })}
                className={`flex-1 ${formData.accountType === 'upi' 
                  ? 'bg-purple-600 hover:bg-purple-700 border-2 border-purple-400' 
                  : 'bg-gray-700 hover:bg-gray-600 border border-gray-500'
                } font-bold py-3 rounded-xl`}
              >
                <Phone className="h-5 w-5 mr-2" />
                📱 UPI ID
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          {formData.accountType === 'bank' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="accountName" className="text-white font-bold">👤 Account Holder Name</Label>
                <Input
                  id="accountName"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder="Enter full name as per bank"
                  className="bg-gray-800/50 border-gray-600 text-white font-bold mt-2 py-3 px-4 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="accountNumber" className="text-white font-bold">🔢 Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="Enter account number"
                  className="bg-gray-800/50 border-gray-600 text-white font-bold mt-2 py-3 px-4 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ifscCode" className="text-white font-bold">🏪 IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={formData.ifscCode}
                  onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="Enter IFSC code"
                  className="bg-gray-800/50 border-gray-600 text-white font-bold mt-2 py-3 px-4 rounded-xl"
                  required
                />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="upiId" className="text-white font-bold">📱 UPI ID</Label>
              <Input
                id="upiId"
                value={formData.upiId}
                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                placeholder="Enter UPI ID (e.g., name@paytm)"
                className="bg-gray-800/50 border-gray-600 text-white font-bold mt-2 py-3 px-4 rounded-xl"
                required
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 font-bold text-lg py-3 rounded-xl border-2 border-gray-500 text-gray-300 hover:bg-gray-800"
            >
              ❌ Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 font-bold text-lg py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            >
              ✅ Confirm Withdrawal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
