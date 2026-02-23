const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { getQueue } = require('./player');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
client.commands = new Collection();

// folder z komendami
const commandsPath = path.join(__dirname, 'commands');

try {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  for (const file of commandFiles) {
    try {
      const cmdPath = path.join(commandsPath, file);
      const cmd = require(cmdPath);
      if (cmd && cmd.data && cmd.execute) {
        client.commands.set(cmd.data.name, cmd);
        console.log(`Loaded command: ${cmd.data.name}`);
      } else {
        console.warn(`File ${file} nie wygląda jak poprawna komenda.`);
      }
    } catch (err) {
      console.warn(`Nie można załadować pliku ${file}:`, err.message);
    }
  }
} catch (err) {
  console.error('Nie można odczytać folderu commands:', err.message);
}

---

## 🔹 Obsługa interactionCreate

client.on('interactionCreate', async interaction => {
  // obsługa przycisków
  if (interaction.isButton()) {
    const queue = getQueue(interaction.guild.id);
    if (!queue) return interaction.reply({ content: 'Nothing playing', ephemeral: true });

    try {
      if (interaction.customId === 'pause') queue.player.pause();
      if (interaction.customId === 'resume') queue.player.unpause();
      if (interaction.customId === 'skip') queue.player.stop();
    } catch (err) {
      console.error('Button error:', err);
    }

    return interaction.deferUpdate();
  }

  // obsługa slash commands
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (cmd) {
    try {
      await cmd.execute(interaction); // <- bardzo ważne: await
    } catch (err) {
      console.error(`Błąd w komendzie ${interaction.commandName}:`, err);
      await interaction.reply({ content: '❌ Wystąpił błąd przy wykonywaniu komendy.', ephemeral: true });
    }
  }
});

// ready event
client.once('ready', () => console.log('Bot ready'));

// login
client.login(process.env.TOKEN);
