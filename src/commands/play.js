
const { SlashCommandBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle } = require('discord.js');
const play = require('play-dl');
const { getQueue, createQueue, playNext } = require('../player');

module.exports={
 data:new SlashCommandBuilder().setName('play').setDescription('Play music').addStringOption(o=>o.setName('query').setRequired(true).setDescription('song')),
 async execute(interaction){
  const query=interaction.options.getString('query');
  let queue=getQueue(interaction.guild.id);
  if(!queue) queue=createQueue(interaction);
  const result=await play.search(query,{limit:1});
  if(!result.length) return interaction.reply('No results');
  queue.songs.push({url:result[0].url});
  if(queue.player.state.status!=='playing') playNext(interaction.guild,queue.autoplay);

  const row=new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('pause').setLabel('⏸').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('resume').setLabel('▶').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('skip').setLabel('⏭').setStyle(ButtonStyle.Secondary)
  );

  interaction.reply({content:`Queued: ${result[0].title}`,components:[row]});
 }
};
