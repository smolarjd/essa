const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const play = require('play-dl');
const { getQueue, createQueue, playNext } = require('../player');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music')
    .addStringOption(o => o
      .setName('query')
      .setRequired(true)
      .setDescription('Song name or URL')
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    console.log('Play command triggered. Query:', query);

    // Pobierz lub utwórz kolejkę
    let queue = getQueue(interaction.guild.id);
    if (!queue) queue = createQueue(interaction);

    try {
      // Wyszukiwanie utworu
      const result = await play.search(query, { limit: 1 });
      console.log('Play-dl search result:', result);

      if (!result.length) return interaction.reply('❌ No results found.');

      const song = {
        url: result[0].url,
        title: result[0].title,
        duration: result[0].durationInSec || 0
      };

      queue.songs.push(song);
      console.log('Song added to queue:', song.title);

      // Uruchom odtwarzanie jeśli nie gra
      if (queue.player && queue.player.state && queue.player.state.status !== 'playing') {
        await playNext(interaction.guild, queue.autoplay);
      }

      // Przyciski kontrolne
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pause').setLabel('⏸').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('resume').setLabel('▶').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('skip').setLabel('⏭').setStyle(ButtonStyle.Secondary)
      );

      await interaction.reply({ content: `✅ Queued: **${song.title}**`, components: [row] });

    } catch (error) {
      console.error('Error in play command:', error);
      interaction.reply('❌ Something went wrong while searching or playing the song.');
    }
  }
};
