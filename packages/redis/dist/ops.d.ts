export declare function rPublish(channel: string, data: any): Promise<number>;
export declare function rSubscribe(channel: string, callback: (message: string) => void): Promise<() => Promise<void>>;
//# sourceMappingURL=ops.d.ts.map