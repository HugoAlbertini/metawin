
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const META_API_KEY = process.env.META_API_KEY;
const CLIENT_ID = process.env.CLIENT_ID; 
const GUILD_ID = process.env.GUILD_ID;  
console.log("asdasd",DISCORD_TOKEN,META_API_KEY , CLIENT_ID, GUILD_ID )

const client = new Client({
  intents: [GatewayIntentBits.Guilds] 
});


const commands = [
  new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Muestra el top 15 del leaderboard MetaWin')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('🔄 Actualizando comandos de Discord...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('✅ Comandos actualizados');
  } catch (error) {
    console.error('❌ Error registrando comandos:', error);
  }
})();

client.once('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ranking') {
    try {
      const response = await axios.get(
        'https://integrations.prod.platform.metawin.com/influencer/leaderboard/ranks',
        { headers: { 'x-api-key': META_API_KEY } }
      );

      const rankings = response.data.rankings.slice(0, 15);
      if (rankings.length === 0) {
        return interaction.reply('No se encontraron resultados 😕');
      }

      let reply = '🏆 **Top 15 players MetaWin** 🏆\n\n';
      rankings.forEach(r => {
        reply += `#${r.rank} — **${r.user}**: $${r.wagered} ${r.currency}\n`;
      });

      await interaction.reply(reply);
    } catch (err) {
      console.error('❌ Error al consultar la API:', err);
      await interaction.reply('❌ Error al consultar la API');
    }
  }
});

client.login(DISCORD_TOKEN);