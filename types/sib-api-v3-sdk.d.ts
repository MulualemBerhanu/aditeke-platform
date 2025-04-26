declare module 'sib-api-v3-sdk' {
  export namespace ApiClient {
    const instance: any;
  }

  export class TransactionalEmailsApi {
    sendTransacEmail(sendSmtpEmail: SendSmtpEmail): Promise<{
      messageId: string;
    }>;
  }

  export class SendSmtpEmail {
    subject?: string;
    sender?: { email: string; name: string };
    to?: { email: string }[];
    htmlContent?: string;
    textContent?: string;
    attachment?: { content: string; name: string }[];
  }
}