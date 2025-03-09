//! 05:50:00
import cron from 'node-cron' // Scheduler
import { sendEmail } from '../utils/sendEmail.js';
import { User } from '../models/userModel.js';
import { Borrow } from '../models/borrowModel.js';

//It will never go down if our server or database is down
export const notifyUsers = () => {
    cron.schedule("*/5 * * * *", async() => {
        try{
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const borrowers = await Borrow.find({
                dueDate:{
                    $lt: oneDayAgo
                },
                returnDate:null,
                notified:false,
            });

            for(const element of borrowers){
                if(element.user && element.user.email){
                    sendEmail({
                        email: element.user.email,
                        subject: `Hello ${element.user.name}.Book Return Reminder",
                        message: "Your book is due today. Please return it on time.`,
                    });
                    element.notified = true;
                    await element.save();
                    console.log(`Email sent to ${element.user.email}`)
                }
            }
        }catch(error){
            console.error("Some error occured while notifying users", error);
        }
    })
}