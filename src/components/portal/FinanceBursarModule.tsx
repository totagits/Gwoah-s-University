import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  FileText,
  Smartphone,
  Building2,
  Lock,
} from 'lucide-react';
import { FinancialAccount, FinancialTransaction, UserProfile } from '../../types';
import { api } from '../../services/api';

interface FinanceBursarModuleProps {
  currentUser: UserProfile;
}

export const FinanceBursarModule: React.FC<FinanceBursarModuleProps> = ({ currentUser }) => {
  const [account, setAccount] = useState<FinancialAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Payment recording form state
  const [amount, setAmount] = useState('150.00');
  const [paymentMethod, setPaymentMethod] = useState('Lonestar MTN Mobile Money');
  const [reference, setReference] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await api.getFinanceAccount('u-student');
      if (res.account) setAccount(res.account);
    } catch (err) {
      console.error('Failed to load financial records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPayment(true);
    setPaymentError(null);
    setPaymentSuccess(null);

    try {
      const res = await api.recordPayment({
        amountUSD: Number(amount),
        paymentMethod,
        reference: reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      });

      if (res.success && res.account) {
        setAccount(res.account);
        setPaymentSuccess(res.message);
        setReference('');
      } else {
        setPaymentError(res.error || 'Failed to process payment');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Payment execution error');
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading || !account) {
    return (
      <div className="flex items-center justify-center p-16 text-amber-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400" />
        <span className="ml-3 text-sm text-slate-300">Loading student financial ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Bursar & Student Financial Accounts
            </h2>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold px-2 py-0.5 rounded-full">
              Automated Reconciliation Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reconcile payments across Lonestar MTN Mobile Money, Orange Money, and EcoBank direct deposit slips with dual-control receipt issuance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
          <span className="text-slate-400">Account:</span>
          <strong className="text-white">{account.studentName}</strong>
          <span className="font-mono text-amber-400 font-bold">({account.studentNumber})</span>
        </div>
      </div>

      {paymentSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{paymentSuccess}</span>
          </div>
          <button onClick={() => setPaymentSuccess(null)} className="font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Tuition Billed</div>
          <div className="text-2xl font-black text-white mt-1">
            ${account.tuitionBilledUSD.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Semester I 2026/2027 (14 cr)</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Scholarship / Subsidy</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            ${account.scholarshipCreditUSD.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">MoE STEM Grant Subsidy</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Paid to Date</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            ${account.totalPaidUSD.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">EcoBank & Mobile Money</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 uppercase font-semibold">Outstanding Balance</div>
          <div className={`text-2xl font-black mt-1 ${account.currentBalanceUSD === 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${account.currentBalanceUSD.toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400 font-bold mt-1">Registration Hold Cleared</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Record Payment Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <span>Record Cashier / Mobile Money Deposit</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Posts instant credit to student ledger and updates registration clearance.
            </p>
          </div>

          {paymentError && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Payment Amount (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Payment Channel / Provider *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Lonestar MTN Mobile Money">Lonestar Cell MTN Mobile Money</option>
                <option value="Orange Money">Orange Money Liberia</option>
                <option value="EcoBank Slip">EcoBank Direct Deposit Slip</option>
                <option value="UBA Bank Deposit">United Bank for Africa (UBA)</option>
                <option value="Direct Cashier">Campus Bursar Cashier (Monrovia)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Bank Deposit Slip / Mobile Money Transaction Reference
              </label>
              <input
                type="text"
                placeholder="e.g., MM-TX-998412 or ECO-10492"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingPayment}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              <span>{submittingPayment ? 'Validating Deposit...' : 'Post Payment to Ledger'}</span>
            </button>
          </form>
        </div>

        {/* Transaction History (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                Ledger Transaction History
              </h3>
              <p className="text-xs text-slate-400">
                Audited financial transactions for {account.studentNumber}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {account.transactions.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Transaction Type</th>
                  <th className="px-3 py-2.5">Reference</th>
                  <th className="px-3 py-2.5">Method</th>
                  <th className="px-3 py-2.5 text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {account.transactions.map((tx) => {
                  const isCredit = tx.type !== 'Tuition Bill' && tx.type !== 'Registration Fee' && tx.type !== 'Lab Fee';
                  return (
                    <tr key={tx.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="px-3 py-2.5 font-mono text-slate-400">{tx.date}</td>
                      <td className="px-3 py-2.5 font-semibold text-white">{tx.type}</td>
                      <td className="px-3 py-2.5 font-mono text-amber-400/90 text-[11px]">{tx.reference}</td>
                      <td className="px-3 py-2.5 text-slate-400 text-[11px]">{tx.paymentMethod || 'Institutional Ledger'}</td>
                      <td className={`px-3 py-2.5 text-right font-mono font-bold ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {isCredit ? `-$${tx.amountUSD.toFixed(2)}` : `+$${tx.amountUSD.toFixed(2)}`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
