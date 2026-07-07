require ('dotenv').config();
const { Telegraf } = require('telegraf');
const { upsertGroup, setGroupActive, getActiveGroups } = require('./groups-store');
const { sundayMessage } = require('./tasks/weekly-message');

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
    console.error('❌ Error: BOT_TOKEN is not defined in the environment variables.');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
// 1- The New /addgroup command (used inside the groups)
bot.command('addgroup', async (ctx) => {
    if(ctx.chat.type === 'private'){
        return ctx.reply("⚠️ Please use this command inside the group you want to register, not here." );
    }
    try{
        // Save the current group to groups.json
        upsertGroup({
            id: ctx.chat.id,
            title: ctx.chat.title,
            username: ctx.chat.username,
            addedBy: ctx.from.id
        });

        console.log(`✅ Group manually registered: ${ctx.chat.title}`);
        await ctx.reply('✅ This group has been successfully registered for the scheduled Sunday messages!');
    }
    catch(error){
        console.error('❌ Error while registering the group:', error);
        await ctx.reply('❌ An error occurred while trying to register this group. Please try again later.');
    }
});

// 2- Automatically disable the group if the bot is kicked or removed 
bot.on('my_chat_member', async (ctx) => {
    const chat = ctx.chat;
    const newStatus = ctx.myChatMember.new_chat_member.status;
    
    if(['left', 'kicked'].includes(newStatus)){
        setGroupActive(String(chat.id), false);
        console.log(
          `🚫 Group disabled: ${chat.title || chat.id} (Bot was removed)`,
        );
    }

});


// Initialize the weekly message task
sundayMessage(bot);

// Launch the bot
bot.launch().then(() => {
    console.log('🤖 Bot is running...');
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));