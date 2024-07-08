const { CronJob } = require('cron');
const {Op} = require('sequelize');
const ChatHistory = require('../models/chat');
const ArchivedChat = require('../models/archeived_chat');
exports.job = new CronJob(
    '0 0 * * *', 
    function () {
        archiveOldRecords();
    },
    null,
    false,
    'Asia/Kolkata'
);

async function archiveOldRecords() {
    try {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      // Find records to archive
      const recordsToArchive = await ChatHistory.findAll({
        where: {
          date_time: {
            [Op.lt]: twoDaysAgo,
          },
        },
      });
  
      // Archive records
      await Promise.all(
        recordsToArchive.map(async (record) => {
          await ArchivedChat.create({
            id: record.id,
            message: record.message,
            date_time: record.date_time,
            isImage:record.isImage,
            isVideo:record.isVideo,
            UserId: record.userId,
            GroupId: record.GroupId
          });
          await record.destroy();
        })
      );
      console.log('Old records archived successfully.');
    } catch (error) {
      console.error('Error archiving old records:', error);
    }
  }

