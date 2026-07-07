const cron = require("node-cron");
function coachesMessage(bot) {
    const timezone = process.env.TIMEZONE || "Asia/Damascus";
    const coachesGroupId = process.env.COACHED_GROUP_ID;

    cron.schedule('0 19 * * 0', async () => {
        if(!coachesGroupId){
            console.error(
              "❌ [Biweekly Message]: No BIWEEKLY_GROUP_ID found in .env file.",
            );
            return;
        }

        const epoch = new Date('2026-07-05');
        const today = new Date();
        const weeksSinceEpoch = Math.floor((today - epoch) / (7 * 24 * 60 * 60  * 1000));

        if(weeksSinceEpoch % 2 !== 0){
            return;
        }
        console.log(
          `⏳ [Biweekly Message]: Preparing to send to specific group ${coachesGroupId}...`
        );
        const messageText =
          "This is your special bi-weekly message!\n\nIt only appears once every 14 days.";
        try{
            await bot.teleram.sendMessage(coachesGroupId, messageText);
            conseole.log("✅ [Biweekly Message]: Successfully sent!");
          }
          catch (error){
            console.error(
              `❌ [Biweekly Message]: Failed to send to group ${coachesGroupId}:`,
              error.description || error.message,
            );
          }
    }, {
        timezone: timezone,
    });
    console.log("📅 Bi-weekly message task scheduled successfully.");
}

module.export = { coachesMessage };