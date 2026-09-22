import nodemailer, { type Transporter } from "nodemailer";

export interface SentEmailRecord {
    to: string;
    from: string;
    subject: string;
    html: string;
    text?: string;
    date: Date;
}

const sentEmailsBuffer: SentEmailRecord[] = [];

export const getSentEmails = (): readonly SentEmailRecord[] => [...sentEmailsBuffer];

export const clearSentEmails = (): void => {
    sentEmailsBuffer.length = 0;
};

export const createEmailTransporter = (): Transporter => {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });
    }

    // Zero-config sandbox transporter for local development and CI testing:
    return {
        sendMail: async (mailOptions: {
            to: string;
            from?: string;
            subject: string;
            html?: string;
            text?: string;
        }) => {
            const from = mailOptions.from || process.env.EMAIL_FROM || "KalTech <notificaciones@kaltech.com>";
            const record: SentEmailRecord = {
                to: mailOptions.to,
                from,
                subject: mailOptions.subject,
                html: mailOptions.html || "",
                text: mailOptions.text,
                date: new Date(),
            };

            sentEmailsBuffer.push(record);

            if (process.env.NODE_ENV !== "test") {
                console.log(`\n[EMAIL SANDBOX] -> Para: ${record.to} | Asunto: "${record.subject}"`);
            }

            return {
                messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                accepted: [mailOptions.to],
                rejected: [],
                response: "250 Mock message queued in sandbox",
            };
        },
    } as unknown as Transporter;
};

export const transporter = createEmailTransporter();
export const defaultEmailFrom = process.env.EMAIL_FROM || "KalTech <notificaciones@kaltech.com>";
