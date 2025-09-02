export type LatestPrice = {
    symbol: string;
    price: number;
    decimals: number;
    buyPrice: number;
    sellPrice: number;
    timestamp: number;
};
export declare function upsertLatestPrice(payload: LatestPrice, ttlSeconds?: number): Promise<import("@redis/client/dist/lib/RESP/types").ReplyUnion[]>;
export declare function getlatestPrice(symbol: string): Promise<LatestPrice | null>;
//# sourceMappingURL=price.d.ts.map