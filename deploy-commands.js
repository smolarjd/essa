
require('dotenv').config();
const fs=require('fs');
const {REST,Routes}=require('discord.js');
const commands=[];
for(const file of fs.readdirSync('./src/commands')){
 const cmd=require(`./src/commands/${file}`);
 commands.push(cmd.data.toJSON());
}
const rest=new REST({version:'10'}).setToken(process.env.TOKEN);
(async()=>{
 await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID,process.env.GUILD_ID),{body:commands});
 console.log('Commands deployed');
})();
