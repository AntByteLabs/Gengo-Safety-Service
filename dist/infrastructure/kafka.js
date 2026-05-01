"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducer = getProducer;
exports.publishEvent = publishEvent;
exports.closeKafka = closeKafka;
const kafkajs_1 = require("kafkajs");
const config_js_1 = require("../config.js");
let producer = null;
let kafka = null;
function getKafka() {
    if (!kafka) {
        kafka = new kafkajs_1.Kafka({
            clientId: config_js_1.config.KAFKA_CLIENT_ID,
            brokers: config_js_1.config.KAFKA_BROKERS.split(',').map((b) => b.trim()),
            logLevel: kafkajs_1.logLevel.WARN,
        });
    }
    return kafka;
}
async function getProducer() {
    if (!producer) {
        producer = getKafka().producer({
            allowAutoTopicCreation: false,
            idempotent: true,
        });
        await producer.connect();
        console.log('[kafka] producer connected');
    }
    return producer;
}
async function publishEvent(topic, key, payload) {
    const p = await getProducer();
    await p.send({
        topic,
        messages: [
            {
                key,
                value: JSON.stringify({ ...payload, publishedAt: Date.now() }),
            },
        ],
    });
}
async function closeKafka() {
    if (producer) {
        await producer.disconnect();
        producer = null;
    }
}
//# sourceMappingURL=kafka.js.map