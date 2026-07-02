export interface WorkerMetadata {
    hostname?: string;
    pid?: number;
    startedAt?: number;
}
export interface WorkerRecord {
    id: string;
    status: 'online' | 'offline';
    lastSeen: number;
    metadata: WorkerMetadata;
}
export interface BuildJobCancellation {
    jobId: string;
    reason: string;
    cancelledAt: number;
}
export declare class WorkerRegistry {
    private workers;
    private cancellations;
    register(workerId: string, metadata?: WorkerMetadata): WorkerRecord;
    heartbeat(workerId: string): WorkerRecord | undefined;
    cancelJob(jobId: string, reason: string): BuildJobCancellation;
    isCancelled(jobId: string): boolean;
    getWorker(workerId: string): WorkerRecord | undefined;
}
export declare function registerWorker(registry: WorkerRegistry, workerId: string, metadata?: WorkerMetadata): WorkerRecord;
export declare function recordHeartbeat(registry: WorkerRegistry, workerId: string): WorkerRecord;
export declare function cancelBuildJob(registry: WorkerRegistry, jobId: string, reason: string): BuildJobCancellation;
export declare function isBuildJobCancelled(registry: WorkerRegistry, jobId: string): boolean;
export declare function startBuildConsumer(workerId?: string): Promise<{
    channel: import("amqplib").Channel;
    connection: import("amqplib").ChannelModel;
    registry: WorkerRegistry;
    workerId: string;
}>;
