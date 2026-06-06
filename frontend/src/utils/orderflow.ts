export const ORDER_ACTIONS: Record<string, string[]> = {
  placed: ["accepted"],
  accepted: ["preparing"],
  preparing: ["ready_for_rider"],
};

export const SELLER_CANCELLABLE = ["placed", "accepted", "preparing"];
