import { searchTransactions } from "@/app/admin/actions/transactions";
import { TransactionTable } from "@/components/admin/transaction-table";

export default async function AdminTransactionsPage() {
  const { transactions, total } = await searchTransactions({ page: 1 });
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-text-main">تراکنش‌ها</h1>
      <TransactionTable initial={transactions} initialTotal={total} />
    </div>
  );
}