import { defaultEmailFrom, getSentEmails, clearSentEmails, transporter } from "../config/email.config.js";
import type { IOrder, OrderStatus } from "../models/Order.model.js";
import { User } from "../models/User.model.js";
import {
    orderCreatedEmailTemplate,
    orderStatusUpdatedEmailTemplate,
    paymentConfirmedEmailTemplate,
    welcomeEmailTemplate,
} from "../templates/email.templates.js";

export { getSentEmails, clearSentEmails };

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
}

export const sendEmail = async ({
    to,
    subject,
    html,
    text,
    from = defaultEmailFrom,
}: SendEmailOptions) => {
    try {
        const result = await transporter.sendMail({
            from,
            to,
            subject,
            html,
            text,
        });

        return result;
    } catch (error) {
        console.error(`[Email Service Error] Falló el envío hacia ${to}:`, error);
        throw error;
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    const template = welcomeEmailTemplate({ name });
    return sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
};

const resolveUserInfo = async (
    userIdOrUser: unknown
): Promise<{ name: string; email: string }> => {
    if (
        typeof userIdOrUser === "object" &&
        userIdOrUser !== null &&
        "name" in userIdOrUser &&
        "email" in userIdOrUser
    ) {
        return {
            name: String((userIdOrUser as { name: unknown }).name),
            email: String((userIdOrUser as { email: unknown }).email),
        };
    }

    if (userIdOrUser) {
        const user = await User.findById(userIdOrUser).select("name email");
        if (user) {
            return {
                name: user.name,
                email: user.email,
            };
        }
    }

    return {
        name: "Cliente",
        email: "cliente@kaltech.com",
    };
};

export const sendOrderCreatedEmail = async (
    userIdOrUser: unknown,
    order: IOrder
) => {
    const user = await resolveUserInfo(userIdOrUser);
    const template = orderCreatedEmailTemplate({
        order,
        customerName: user.name,
        customerEmail: user.email,
    });

    return sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
};

export const sendPaymentConfirmedEmail = async (order: IOrder) => {
    const user = await resolveUserInfo(order.user);
    const template = paymentConfirmedEmailTemplate({
        order,
        customerName: user.name,
        customerEmail: user.email,
    });

    return sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
};

export const sendOrderStatusUpdatedEmail = async (
    order: IOrder,
    newStatus: OrderStatus
) => {
    const user = await resolveUserInfo(order.user);
    const template = orderStatusUpdatedEmailTemplate({
        order,
        customerName: user.name,
        customerEmail: user.email,
        newStatus,
    });

    return sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
    });
};
