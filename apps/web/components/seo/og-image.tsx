import { ImageResponse } from "next/og";

const fontSans = "Albert Sans, Arial, sans-serif";
const albertSans500 = fetch(
  "https://fonts.gstatic.com/s/albertsans/v4/i7dZIFdwYjGaAMFtZd_QA3xXSKZqhr-TenSHmZP_rA.ttf",
).then((res) => res.arrayBuffer());
const albertSans600 = fetch(
  "https://fonts.gstatic.com/s/albertsans/v4/i7dZIFdwYjGaAMFtZd_QA3xXSKZqhr-TenSHdZT_rA.ttf",
).then((res) => res.arrayBuffer());

/**
 * Shared branded OG card (text-only so no logo asset can go stale).
 * Same visual system as the component OG images: deep-blue gradient,
 * brand row, eyebrow, and headline.
 */
export async function brandOgImage(eyebrow: string, title: string) {
  const [fontMedium, fontSemibold] = await Promise.all([
    albertSans500,
    albertSans600,
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#061942",
        fontFamily: fontSans,
        backgroundImage:
          "radial-gradient(circle at 92% 8%, #ffffff 0%, #d7dceb 16%, rgba(215,220,235,0) 36%), radial-gradient(circle at 88% 88%, #bcc5e0 0%, rgba(188,197,224,0.58) 22%, rgba(188,197,224,0) 48%), radial-gradient(circle at 16% 10%, #061942 0%, rgba(6,25,66,0.78) 30%, rgba(6,25,66,0) 56%), linear-gradient(125deg, #061942 0%, #0870e8 50%, #539cf2 78%, #8bc0fc 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "radial-gradient(circle at 18% 20%, rgba(3,6,17,0.62), transparent 44%), radial-gradient(circle at 42% 56%, rgba(3,6,17,0.26), transparent 34%), linear-gradient(90deg, rgba(3,6,17,0.24), transparent 70%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 104,
          top: 120,
          display: "flex",
          alignItems: "center",
          color: "#ffffff",
          fontFamily: fontSans,
          fontSize: 38,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: "-0.045em",
        }}
      >
        DavinciUI
      </div>

      <div
        style={{
          position: "absolute",
          left: 104,
          top: 292,
          width: 920,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            marginBottom: 14,
            color: "rgba(255,255,255,0.68)",
            fontFamily: fontSans,
            fontSize: 30,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: "-0.035em",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            color: "#F6FCFF",
            fontFamily: fontSans,
            fontSize: 76,
            fontWeight: 600,
            lineHeight: 0.96,
            letterSpacing: "-0.055em",
          }}
        >
          {title}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Albert Sans",
          data: fontMedium,
          style: "normal",
          weight: 500,
        },
        {
          name: "Albert Sans",
          data: fontSemibold,
          style: "normal",
          weight: 600,
        },
      ],
    },
  );
}
