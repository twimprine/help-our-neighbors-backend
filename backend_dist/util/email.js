"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emailTemplates_1 = require("./emailTemplates");
exports.HELPFUL_NEIGHBOURS_EMAIL = "info@helpfulneighbours.com.au";
exports.sendOfferConfirmationEmail = async (mailgun, fromEmail, senderName, recipientName) => {
    const formattedEmail = emailTemplates_1.getReplyToOfferConfirmationEmailTemplate(senderName, recipientName);
    var data = {
        from: `Helpful Neighbours <${exports.HELPFUL_NEIGHBOURS_EMAIL}>`,
        to: fromEmail,
        subject: 'Offer to Help Confirmation',
        html: formattedEmail
    };
    return await mailgun.messages().send(data);
};
exports.sendListingConfirmationEmail = async (mailgun, listingId, email, name, secretToken) => {
    const formattedEmail = emailTemplates_1.getListingConfirmationEmailTemplate(name, listingId, secretToken);
    var data = {
        from: `Helpful Neighbours <${exports.HELPFUL_NEIGHBOURS_EMAIL}>`,
        to: email,
        subject: 'Listing Confirmation',
        html: formattedEmail
    };
    return await mailgun.messages().send(data);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1haWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbC9lbWFpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFEQUFnSDtBQUVuRyxRQUFBLHdCQUF3QixHQUFHLCtCQUErQixDQUFBO0FBRTFELFFBQUEsMEJBQTBCLEdBQUcsS0FBSyxFQUFFLE9BQVksRUFBRSxTQUFpQixFQUFFLFVBQWtCLEVBQUUsYUFBcUIsRUFBRSxFQUFFO0lBQzNILE1BQU0sY0FBYyxHQUFHLHlEQUF3QyxDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUMxRixJQUFJLElBQUksR0FBRztRQUNQLElBQUksRUFBRSx1QkFBdUIsZ0NBQXdCLEdBQUc7UUFDeEQsRUFBRSxFQUFFLFNBQVM7UUFDYixPQUFPLEVBQUUsNEJBQTRCO1FBQ3JDLElBQUksRUFBRSxjQUFjO0tBQ3ZCLENBQUE7SUFDRCxPQUFPLE1BQU0sT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQyxDQUFDLENBQUE7QUFFWSxRQUFBLDRCQUE0QixHQUFHLEtBQUssRUFBRSxPQUFZLEVBQUUsU0FBaUIsRUFBRSxLQUFhLEVBQUUsSUFBWSxFQUFFLFdBQW1CLEVBQUUsRUFBRTtJQUNwSSxNQUFNLGNBQWMsR0FBRyxvREFBbUMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBQyxDQUFBO0lBQ3hGLElBQUksSUFBSSxHQUFHO1FBQ1AsSUFBSSxFQUFFLHVCQUF1QixnQ0FBd0IsR0FBRztRQUN4RCxFQUFFLEVBQUUsS0FBSztRQUNULE9BQU8sRUFBRSxzQkFBc0I7UUFDL0IsSUFBSSxFQUFFLGNBQWM7S0FDdkIsQ0FBQTtJQUNELE9BQU8sTUFBTSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9DLENBQUMsQ0FBQSJ9