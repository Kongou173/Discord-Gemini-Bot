const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://api.gemini.com/v1/pubticker/btcusd';

// 会話履歴を保持するマップ
const conversationHistory = new Map();

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const userId = message.author.id;

    if (message.content.startsWith('/chat_clear')) {
        conversationHistory.delete(userId);
        message.channel.send('会話履歴がクリアされました。');
        console.log(`Conversation history cleared for user ${userId}`);
        return;
    }

    if (!conversationHistory.has(userId)) {
        conversationHistory.set(userId, []);
    }

    conversationHistory.get(userId).push(message.content);

    if (message.content.startsWith('!gemini')) {
        try {
            const response = await axios.get(GEMINI_API_URL, {
                headers: { 'X-GEMINI-APIKEY': GEMINI_API_KEY }
            });
            const data = response.data;
            message.channel.send(`BTC/USD:\nLast: ${data.last}\nAsk: ${data.ask}\nBid: ${data.bid}`);
            console.log(`Successfully fetched data from Gemini API for user ${userId}`);
        } catch (error) {
            message.channel.send(`Error: ${error.response ? error.response.status : error.message}`);
            console.error(`Error fetching data from Gemini API: ${error.message}`);
        }
    } else {
        message.channel.send(`会話履歴: ${conversationHistory.get(userId).join(', ')}`);
    }
});

client.login(DISCORD_TOKEN);
