import { getSessionUser } from "@/lib/auth";
import { CoinBalanceHeader } from "./coin-balance-header";

export async function UserHeaderSection() {
  const user = await getSessionUser();
  return <CoinBalanceHeader coinsBalance={user?.coinsBalance ?? 0} authenticated={Boolean(user)} />;
}