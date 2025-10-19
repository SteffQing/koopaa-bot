import { getEnv } from "../utils";

const BOT_TOKEN = getEnv("BOT_TOKEN");
const BASE_API_URL = getEnv("BASE_API_URL");

export { BOT_TOKEN, BASE_API_URL };
