import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import env from '../../util/validateEnv';

export async function sendMail(req: Request, res: Response, next: NextFunction) {

  const email = req.body.email;
  const userName = req.body?.userName || 'there..';
  const content = req.body?.content;
  const subject = req.body?.subject;
  const joinLink = req.body?.joinLink;

  if (!email || !content) return next(createHttpError(501, 'Invalid input'));

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',

    auth: {
      user: 'foundrofficial@gmail.com',
      pass: env.MAIL_PASSWORD,
    }
  });

  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'foundr.',
      link: 'https://www.foundr.site/'
    }
  })

  // EVENT INVITATION CONTENT
  const invitation = {
    body: {
      greeting: 'Congratulations',
      name: userName,
      intro: 'You have successfully registed for the event.',
      action: {
        instructions: 'To join the Discord server, please click the button below.',
        button: {
          color: '#22BC66',
          text: 'Join',
          link: joinLink,
        }
      },
      outro: 'We are excited to see you there.',
      signature: 'Cheers...'
    }
  };

  // EMAIL VERIFICATION CONTENT
  const emailVerificaton = {
    body: {
      name: userName,
      intro: content,
      signature: false,
    }
  }

  const emailBody = content === 'invitation' ? mailGenerator.generate(invitation) : mailGenerator.generate(emailVerificaton);


  const message = {
    from: "foundrofficial@gmail.com",
    to: email,
    subject: subject || 'Email verification', // Subject line
    html: emailBody
  }

  // send mail with defined transport object
  await transporter.sendMail(message).then((info) => {

    res.status(201).json({
      message: 'mail sent successfully',
      info: info.messageId,
      preview: nodemailer.getTestMessageUrl(info)
    })

  }).catch((error) => { res.send(500).json({ error }) })

}
