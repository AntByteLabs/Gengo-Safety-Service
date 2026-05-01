import { Producer } from 'kafkajs';
export declare function getProducer(): Promise<Producer>;
export declare function publishEvent(topic: string, key: string, payload: Record<string, unknown>): Promise<void>;
export declare function closeKafka(): Promise<void>;
//# sourceMappingURL=kafka.d.ts.map