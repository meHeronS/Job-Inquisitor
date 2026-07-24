import Redis from 'ioredis';
import { config } from './env.js';

let redisClient = null;

export function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      lazyConnect: true,
      maxRetriesPerRequest: null,
    });
  }
  return redisClient;
}
