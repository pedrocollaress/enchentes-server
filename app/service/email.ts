import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "onboarding@resend.dev";

const TO_EMAIL = "pedro.collares05@gmail.com";

/**
 * Envia um alerta de e-mail de pulso detectado.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendEmailAlert() {
  try {
    const now = new Date().toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      subject: `🚨 Alerta de Enchente: Pulso Detectado!`,
      html: `
        <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 40px 20px;">
              <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                <!-- Header com faixa de alerta -->
                <tr>
                  <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 30px 40px; text-align: center;">
                    <div style="background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 80px; height: 80px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; line-height: 1;">
                      <span style="font-size: 48px; display: block; line-height: 1; margin: 0; padding: 0;">⚠️</span>
                    </div>
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      Alerta de Enchente
                    </h1>
                    <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                      ATENÇÃO IMEDIATA NECESSÁRIA
                    </p>
                  </td>
                </tr>
                
                <!-- Conteúdo principal -->
                <tr>
                  <td style="padding: 40px;">
                    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                      <p style="margin: 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                        <strong>Um novo pulso do sensor foi detectado.</strong> Esta área está sujeita a enchentes e requer atenção imediata.
                      </p>
                    </div>
                    
                    <!-- Informações do alerta -->
                    <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                      <tr>
                        <td style="padding: 15px; background-color: #f9fafb; border-radius: 4px;">
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                🕐 Horário do Alerta
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #1f2937; font-size: 18px; font-weight: 700;">
                                ${now}
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">
                                Horário de Brasília (UTC-3)
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Orientações -->
                    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                      <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                        ⚡ Recomendações
                      </h3>
                      <ul style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                        <li>Monitore constantemente as condições da área</li>
                        <li>Mantenha-se atento a novos alertas</li>
                        <li>Siga os protocolos de segurança estabelecidos</li>
                      </ul>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                      Flood Monitor
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                      Sistema de Monitoramento de Enchentes<br>
                      Este é um alerta automático gerado pelo sistema
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Footer externo -->
              <table role="presentation" style="max-width: 600px; margin: 20px auto 0;">
                <tr>
                  <td style="text-align: center; padding: 20px;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      Você está recebendo este email porque está inscrito no sistema de alertas.<br>
                      Em caso de dúvidas, entre em contato com o suporte.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
      `,
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log(
      "[Email Service] Alerta de email enviado com sucesso:",
      data?.id
    );
    return { success: true, data: data?.id };
  } catch (error) {
    console.error("[Email Service] Erro ao enviar email:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}
