"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HTML_HEADERS = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml"
    xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
    <title>Helpful Neighbours</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0 " />
    <meta name="format-detection" content="telephone=no"/>
    <style type="text/css">
    body {
    margin: 0;
    padding: 0;
    -webkit-text-size-adjust: 100% !important;
    -ms-text-size-adjust: 100% !important;
    -webkit-font-smoothing: antialiased !important;
    font-family: 'Times New Roman';
    text-align: center; 
    }
    p {
    Margin: 0px !important;
    Padding: 0px !important;
    }
    </style>
    </head>
`;
exports.getReplyToOfferEmailTemplate = (senderName, recipientName, message, email) => {
    return `
        ${HTML_HEADERS}
        <body class="em_body" style="margin:0px auto; padding:0px;">
        <div>
        <p>
        Hi ${recipientName},
        <br><br>
        Someone's gotten in touch about your ask/offer of help on helpful neighbours! Here's their message:
        <br><br>
        <i>"${message}"</i>
        <br><br>
        Get in touch with ${senderName ? senderName : "them"} at <strong>${email}</strong>.
        <br><br>
        Cheers!
        </p>
        </div>
        </body>
        </html>
        `;
};
exports.getReplyToOfferConfirmationEmailTemplate = (senderName, recipientName) => {
    return `
        ${HTML_HEADERS}
        <body class="em_body" style="margin:0px auto; padding:0px;">
        <div>
        <p>
        Hi ${senderName},
        <br><br>
        We've let ${recipientName} know about your ask/offer of help on helpful neighbours.
        <br><br>
        Cheers!
        </p>
        </div>
        </body>
        </html>
        `;
};
exports.getListingConfirmationEmailTemplate = (name, listingId, secretToken) => {
    return `
        ${HTML_HEADERS}
        <body class="em_body" style="margin:0px auto; padding:0px;">
        <div>
        <p>
        Hi ${name},
        <br><br>
        We've added your ask/offer of help on helpful neighbours.
        <br><br>
        This link can be used to remove your listing at any time:
        <br>
        https://www.helpfulneighbours.com/delete-listing?secretToken=${secretToken}&listingId=${listingId}
        <br><br>
        Cheers!
        </p>
        </div>
        </body>
        </html>
        `;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW1haWxUZW1wbGF0ZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbC9lbWFpbFRlbXBsYXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQU0sWUFBWSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EyQnBCLENBQUE7QUFFWSxRQUFBLDRCQUE0QixHQUFHLENBQUMsVUFBOEIsRUFBRSxhQUFxQixFQUFFLE9BQWUsRUFBRSxLQUFhLEVBQUUsRUFBRTtJQUNsSSxPQUFPO1VBQ0QsWUFBWTs7OzthQUlULGFBQWE7Ozs7Y0FJWixPQUFPOzs0QkFFTyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxlQUFlLEtBQUs7Ozs7Ozs7U0FPdkUsQ0FBQTtBQUNMLENBQUMsQ0FBQTtBQUdRLFFBQUEsd0NBQXdDLEdBQUcsQ0FBQyxVQUFrQixFQUFFLGFBQXFCLEVBQUUsRUFBRTtJQUNsRyxPQUFPO1VBQ0QsWUFBWTs7OzthQUlULFVBQVU7O29CQUVILGFBQWE7Ozs7Ozs7U0FPeEIsQ0FBQTtBQUNMLENBQUMsQ0FBQTtBQUVRLFFBQUEsbUNBQW1DLEdBQUcsQ0FBQyxJQUFZLEVBQUUsU0FBaUIsRUFBRSxXQUFtQixFQUFFLEVBQUU7SUFDeEcsT0FBTztVQUNELFlBQVk7Ozs7YUFJVCxJQUFJOzs7Ozs7dUVBTXNELFdBQVcsY0FBYyxTQUFTOzs7Ozs7O1NBT2hHLENBQUE7QUFDTCxDQUFDLENBQUEifQ==