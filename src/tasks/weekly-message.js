const cron = require("node-cron");
const { getActiveGroups, setGroupActive } = require("../groups-store");

function sundayMessage(bot) {
    const timezone = process.env.TIMEZONE || "Asia/Damascus";

    cron.schedule("* * * * *", async () => {
        const activeGroups = getActiveGroups();

        if(activeGroups.length === 0){
            console.log("⏳ [Weekly Message]: No active groups found to send messages to.");
            return;
        }

        console.log(
          `⏳ [Weekly Message]: Preparing to send messages to ${activeGroups.length} group(s)...`,
        );
const messageText =
  "تذكير أسبوعي 📅\nيرجى إتمام تعبئة استمارة المتابعة الأسبوعية عبر الرابط التالي:\nhttps://docs.google.com/forms/d/e/1FAIpQLSflv4lrXW3-ZEv3P3hegpwKXvXjXeIwQTNUJ8vjhafJdPGkyA/viewform\n\nيعطيكم العافية جميعاً!";

        for(const group of activeGroups){
            try{
                await bot.telegram.sendMessage(group.id, messageText);
                console.log(
                  `✅ [Weekly Message]: Successfully sent to group "${group.title}"`,
                );
            }catch(error){
                console.error(
                  `❌ [Weekly Message]: Failed to send to "${group.title}" (${group.id}):`,
                  error.description || error.message,
                );
                const errorCode = error.response && error.response.error_code;
                if(errorCode === 403 || errorCode === 400){
                    setGroupActive(group.id, false);
                    console.log(
                      `🚫 Auto-disabled group "${group.title}" due to permission error.`,
                    );
                }
            }
        }
    }, {
        timezone: timezone
    });
    console.log("📅 Weekly message task scheduled successfully.");
}

module.exports = { sundayMessage };