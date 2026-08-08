import { beginCell } from "@ton/core";

export function buildTonCommentPayload(comment: string): string {
  const cell = beginCell().storeUint(0, 32).storeStringTail(comment).endCell();
  return cell.toBoc().toString("base64");
}

export const TON_TRANSACTION_VALID_SECONDS = 300;