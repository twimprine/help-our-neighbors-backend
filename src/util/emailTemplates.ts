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
`

export const getReplyToOfferEmailTemplate = (senderName: string | undefined, recipientName: string, message: string, email: string) => {
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
        `
    }


export const getReplyToOfferConfirmationEmailTemplate = (senderName: string, recipientName: string) => {
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
        `
    }

export const getListingConfirmationEmailTemplate = (name: string, secretToken: string) => {
    return `
        ${HTML_HEADERS}
        <body class="em_body" style="margin:0px auto; padding:0px;">
        <div>
        <p>
        Hi ${name},
        <br><br>
        We've added your ask/offer of help on helpful neighbours.
        <br><br>
        You can provide this token if you decide to remove your listing later: <strong>${secretToken}</strong>
        <br><br>
        Cheers!
        </p>
        </div>
        </body>
        </html>
        `
    }