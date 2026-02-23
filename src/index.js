
require('dotenv').config();
const fs=require('fs');
const {Client,Collection,GatewayIntentBits}=require('discord.js');
const {getQueue}=require('./player');

const client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildVoiceStates]});
client.commands=new Collection();

for(const file of fs.readdirSync('./src/commands').filter(f=>f.endsWith('.js'))){
 const cmd=require(`./commands/${file}`);
 client.commands.set(cmd.data.name,cmd);
}

client.on('interactionCreate',async interaction=>{
 if(interaction.isButton()){
  const queue=getQueue(interaction.guild.id);
  if(!queue) return interaction.reply({content:'Nothing playing',ephemeral:true});
  if(interaction.customId==='pause') queue.player.pause();
  if(interaction.customId==='resume') queue.player.unpause();
  if(interaction.customId==='skip') queue.player.stop();
  return interaction.deferUpdate();
 }

 if(!interaction.isChatInputCommand()) return;
 const cmd=client.commands.get(interaction.commandName);
 if(cmd) cmd.execute(interaction);
});

client.once('ready',()=>console.log('Bot ready'));
client.login(process.env.TOKEN);
console.log("TOKEN exists:", !!process.env.TOKEN);
