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
        <div>
          <h1>Alerta de Enchente</h1>
          <p>Um novo pulso do sensor foi detectado e sua área está sujeita a enchentes! .</p>
          <p><strong>Horário do Alerta:</strong> ${now} (Horário de Brasília)</p>
          <p><br>Flood Monitor</p>
        </div>
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
