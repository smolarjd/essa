
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');
const queues = new Map();

async function advancedAutoplay(queue){
 const info=await play.video_basic_info(queue.lastUrl);
 const related=info.related_videos.filter(v=>v.id && v.durationInSec>20)
   .filter(v=>!queue.seedArtists.has(v.channel?.name))
   .sort(()=>Math.random()-0.5).slice(0,6);
 if(!related.length) return null;
 const next=related[Math.floor(Math.random()*related.length)];
 queue.seedArtists.add(next.channel?.name);
 return {url:`https://www.youtube.com/watch?v=${next.id}`,title:next.title};
}

async function playNext(guild,autoplay){
 const queue=queues.get(guild.id);
 if(!queue) return;
 if(!queue.songs.length){
  if(autoplay && queue.lastUrl){
   const next=await advancedAutoplay(queue);
   if(next) queue.songs.push(next);
   else{queue.connection.destroy();queues.delete(guild.id);return;}
  } else {queue.connection.destroy();queues.delete(guild.id);return;}
 }
 const song=queue.songs.shift();
 queue.lastUrl=song.url;
 const stream=await play.stream(song.url);
 const resource=createAudioResource(stream.stream,{inputType:stream.type});
 queue.player.play(resource);
}

function getQueue(id){return queues.get(id);}

function createQueue(interaction){
 const connection=joinVoiceChannel({
  channelId:interaction.member.voice.channel.id,
  guildId:interaction.guild.id,
  adapterCreator:interaction.guild.voiceAdapterCreator
 });
 const player=createAudioPlayer();
 connection.subscribe(player);
 const queue={connection,player,songs:[],autoplay:false,lastUrl:null,seedArtists:new Set()};
 player.on(AudioPlayerStatus.Idle,()=>playNext(interaction.guild,queue.autoplay));
 queues.set(interaction.guild.id,queue);
 return queue;
}

module.exports={getQueue,createQueue,playNext};
