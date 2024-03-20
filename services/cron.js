const { CronJob } = require('cron');
const {Op} = require('sequelize');
const ChatHistory = require('../models/Chat');
const ArchivedChat = require('../models/archeived-chat');
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
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 2);
      // Find records to archive
      const recordsToArchive = await ChatHistory.findAll({
        where: {
          date_time: {
            [Op.lt]: tenDaysAgo,
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

// async function archiveOldRecords() {
//     try {
  
//       const fiveMinutesAgo = new Date();
//       fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
  
//       // Find records to archive
//       const recordsToArchive = await ChatHistory.findAll({
//         where: {
//           date_time: {
//             [Op.lt]: fiveMinutesAgo,
//           },
//         },
//       });  
//       await Promise.all(
//         recordsToArchive.map(async (record) => {
//           await ArchivedChat.create({
//             id: record.id,
//             message: record.message,
//             isImage:record.isImage, 
//             date_time: record.date_time,
//             UserId: record.UserId,
//             GroupId: record.GroupId
//           });
//           await record.destroy();
//         })
//       );
//     } catch (error) {
//       console.error('Error archiving old records:', error);
//     }
//   }