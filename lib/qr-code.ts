import "server-only";
import QRCode from "qrcode";

export async function generateQrSvg(value: string): Promise<string> {
  return QRCode.toString(value, {
    type: "svg",
    margin: 1,
    color: {
      dark: "#FFFFFF",
      light: "#00000000",
    },
  });
}