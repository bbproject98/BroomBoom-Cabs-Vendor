/**
 * PRP SMS Gateway Dispatcher
 * Sends OTP SMS using credentials configured in .env
 */

interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  rawResponse?: string;
}

export async function sendOtpSms(
  mobileNumber: string,
  otpCode: string
): Promise<SendSmsResult> {
  const apiKey = process.env.SMS_API_KEY || "Ca1adYHLFha6mST";
  const baseUrl =
    process.env.SMS_BASE_URL ||
    "https://api.prpsms.biz/BulkSMSapi/keyApiSendSMS/SendSmsTemplateName";
  const senderId = process.env.SMS_SENDER_ID || "BBCABS";

  const cleanMobile = mobileNumber.replace(/\D/g, "").slice(-10);

  try {
    const payload = {
      sender: senderId,
      templateName: "for Cab",
      smsReciever: [
        {
          mobileNo: cleanMobile,
          templateParams: String(otpCode),
        },
      ],
    };

    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await res.text();
    console.log(
      `[PRP SMS] Dispatched to +91 ${cleanMobile} -> Status: ${res.status}, Response: ${responseText}`
    );

    let isSuccess = res.ok;
    try {
      const parsed = JSON.parse(responseText);
      if (parsed && typeof parsed.isSuccess === "boolean") {
        isSuccess = parsed.isSuccess;
      }
    } catch {}

    return {
      success: isSuccess,
      rawResponse: responseText,
    };
  } catch (error: any) {
    console.warn("[PRP SMS Dispatch Exception]:", error.message);
    return {
      success: false,
      error: error.message || "Failed to dispatch SMS through gateway",
    };
  }
}

