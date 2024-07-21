import discord
import aiohttp
import os

intents = discord.Intents.default()
intents.messages = True
client = discord.Client(intents=intents)

# 会話履歴を保持する辞書
conversation_history = {}

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_API_URL = 'https://api.gemini.com/v1/pubticker/btcusd'

@client.event
async def on_ready():
    print(f'Logged in as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    user_id = message.author.id

    if message.content.startswith('/chat_clear'):
        if user_id in conversation_history:
            del conversation_history[user_id]
        await message.channel.send("会話履歴がクリアされました。")
        return

    if user_id not in conversation_history:
        conversation_history[user_id] = []

    conversation_history[user_id].append(message.content)

    if message.content.startswith('!gemini'):
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(GEMINI_API_URL, headers={'X-GEMINI-APIKEY': GEMINI_API_KEY}) as response:
                    if response.status == 200:
                        data = await response.json()
                        await message.channel.send(
                            f"BTC/USD:\nLast: {data['last']}\nAsk: {data['ask']}\nBid: {data['bid']}"
                        )
                    else:
                        await message.channel.send(f"Error: {response.status}")
            except Exception as e:
                await message.channel.send(f"Error: {str(e)}")
    else:
        await message.channel.send(f'会話履歴: {conversation_history[user_id]}')

client.run(DISCORD_TOKEN)
