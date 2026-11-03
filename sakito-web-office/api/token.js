// 入室許可証(LiveKitのアクセストークン)を発行する関数。
// 合言葉が合っていれば、2Fラウンジの通話ルームに入れるトークンを返す。
// 秘密鍵はVercelの環境変数にだけ置き、ブラウザには絶対に渡さない。
import { AccessToken } from "livekit-server-sdk";
import crypto from "node:crypto";

const ROOM = "sakito-web-2f";

function sameText(a, b) {
  const x = Buffer.from(String(a));
  const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POSTで送ってください" });
  }
  const { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL, ROOM_PASSCODE } = process.env;
  if (!LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !LIVEKIT_URL || !ROOM_PASSCODE) {
    return res.status(500).json({ error: "環境変数が設定されていません" });
  }
  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const name = String(body.name || "").trim().slice(0, 12);
  if (!name) return res.status(400).json({ error: "名前を入れてください" });
  if (!sameText(body.passcode || "", ROOM_PASSCODE)) {
    return res.status(401).json({ error: "合言葉が違います" });
  }
  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: crypto.randomUUID(),
    name,
    ttl: "8h",
  });
  at.addGrant({
    roomJoin: true,
    room: ROOM,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true,
  });
  return res.status(200).json({ token: await at.toJwt(), url: LIVEKIT_URL });
}
