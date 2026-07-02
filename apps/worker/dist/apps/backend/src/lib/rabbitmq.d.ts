export declare const BUILD_QUEUE = "build-queue";
export declare const BUILD_DLQ = "build-dlq";
export declare const BUILD_QUEUE_RETRY = "build-retry";
export interface BuildQueuePublisher {
    publishBuildJob(job: unknown): Promise<void>;
}
export declare function createRabbitMqConnection(): Promise<import("amqplib").ChannelModel>;
export declare function createBuildQueueChannel(): Promise<{
    connection: import("amqplib").ChannelModel;
    channel: import("amqplib").Channel;
}>;
export declare function publishBuildJob(job: unknown): Promise<void>;
export declare function consumeBuildJobs(handler: (job: unknown) => Promise<void>): Promise<{
    connection: import("amqplib").ChannelModel;
    channel: import("amqplib").Channel;
}>;
export declare function handleBuildJobFailure(prisma: {
    workflowRun: {
        update: (args: {
            where: {
                id: string;
            };
            data: {
                status: string;
            };
        }) => Promise<unknown>;
    };
}, job: {
    id: string;
    repository: string;
    branch: string;
    status: string;
    attempt?: number;
    maxAttempts?: number;
}, error: unknown, publisher: {
    publishBuildJob: (job: unknown) => Promise<void>;
}): Promise<{
    status: string;
    attempt: number;
}>;
