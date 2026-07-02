export interface QueueMonitorStatus {
    status: 'ok';
    checkedAt: number;
    heartbeat: number;
}
export declare function monitorBuildQueue(workerId?: string): Promise<{
    status: "ok";
    checkedAt: number;
    heartbeat: number;
}>;
