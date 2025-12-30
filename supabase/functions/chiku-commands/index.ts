// Lovable Cloud backend function: proxies external command APIs to avoid browser CORS issues

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CommandRequest =
  | { command: "imagegen"; prompt: string }
  | { command: "tts"; text: string }
  | { command: "neko" }
  | { command: "waifu" }
  | { command: "hug" }
  | { command: "pat" }
  | { command: "kiss" }
  | { command: "wave" }
  | { command: "smile" }
  | { command: "blush" }
  | { command: "poke" }
  | { command: "dance" };

function toBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Partial<CommandRequest>;

    if (body.command === "imagegen") {
      const prompt = (body.prompt ?? "").toString().trim();
      if (!prompt) {
        return new Response(JSON.stringify({ error: "Missing prompt" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Primary API: returns image directly
      const primaryUrl = `https://image.itz-ashlynn.workers.dev/generate?prompt=${encodeURIComponent(
        prompt,
      )}&version=flux&size=1024x1024`;

      let imageBytes: Uint8Array | null = null;
      let contentType = "image/png";

      // Try primary API first
      try {
        const primaryRes = await fetch(primaryUrl);
        if (primaryRes.ok) {
          const ct = primaryRes.headers.get("content-type") || "";
          if (ct.startsWith("image/")) {
            imageBytes = new Uint8Array(await primaryRes.arrayBuffer());
            contentType = ct;
            console.log("Primary image API succeeded");
          }
        } else {
          console.error("Primary image API failed:", primaryRes.status);
        }
      } catch (e) {
        console.error("Primary image API error:", e);
      }

      // Fallback to death-image API if primary failed
      if (!imageBytes) {
        console.log("Falling back to death-image API");
        const fallbackUrl = `https://death-image.ashlynn.workers.dev/generate?prompt=${encodeURIComponent(
          prompt,
        )}&image=1&dimensions=3:4&safety=true`;

        const fallbackRes = await fetch(fallbackUrl);
        const text = await fallbackRes.text();

        if (!fallbackRes.ok) {
          console.error("Fallback imagegen error", fallbackRes.status, text);
          return new Response(
            JSON.stringify({ error: `Image generation failed (${fallbackRes.status})` }),
            {
              status: 502,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }

        try {
          const payload = JSON.parse(text);
          const imageUrls: string[] = payload?.images || [];
          if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
            return new Response(JSON.stringify({ error: "No images generated" }), {
              status: 502,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          const imageRes = await fetch(imageUrls[0]);
          if (!imageRes.ok) {
            return new Response(
              JSON.stringify({ error: `Image fetch failed (${imageRes.status})` }),
              {
                status: 502,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              },
            );
          }

          imageBytes = new Uint8Array(await imageRes.arrayBuffer());
          contentType = imageRes.headers.get("content-type") || "image/png";
        } catch (e) {
          console.error("Fallback parse error", e);
          return new Response(JSON.stringify({ error: "Image generation failed" }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      const base64 = toBase64(imageBytes);
      const imageDataUrl = `data:${contentType};base64,${base64}`;

      return new Response(JSON.stringify({ images: [imageDataUrl] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.command === "tts") {
      const text = (body.text ?? "").toString().trim();
      if (!text) {
        return new Response(JSON.stringify({ error: "Missing text" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Yabes TTS API: returns JSON with audio_url
      const encodedText = encodeURIComponent(text);
      const ttsApiUrl = `https://yabes-api.pages.dev/api/tools/tts?text=${encodedText}&voice=nova`;

      const metaRes = await fetch(ttsApiUrl);
      const metaText = await metaRes.text();
      if (!metaRes.ok) {
        console.error("tts meta upstream error", metaRes.status, metaText);
        return new Response(JSON.stringify({ error: `TTS failed (${metaRes.status})` }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let audioUpstreamUrl = "";
      try {
        const meta = JSON.parse(metaText);
        if (meta?.success && meta?.result?.audio_url) {
          audioUpstreamUrl = meta.result.audio_url;
        }
      } catch {
        // ignore
      }

      if (!audioUpstreamUrl) {
        console.error("tts meta parse error or missing audio_url", metaText);
        return new Response(JSON.stringify({ error: "TTS failed (bad response)" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Fetch audio bytes and return as base64 data URL for reliable playback + download.
      const audioRes = await fetch(audioUpstreamUrl);
      if (!audioRes.ok) {
        const errText = await audioRes.text().catch(() => "");
        console.error("tts audio fetch error", audioRes.status, errText);
        return new Response(
          JSON.stringify({ error: `TTS failed (${audioRes.status})` }),
          {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const bytes = new Uint8Array(await audioRes.arrayBuffer());
      const base64 = toBase64(bytes);
      const contentType = audioRes.headers.get("content-type") || "audio/wav";
      const audioDataUrl = `data:${contentType};base64,${base64}`;

      return new Response(JSON.stringify({ audioDataUrl }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle /neko command
    if (body.command === "neko") {
      try {
        const nekoRes = await fetch("https://nekos.best/api/v2/neko");
        if (!nekoRes.ok) {
          return new Response(JSON.stringify({ error: `Neko API failed (${nekoRes.status})` }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const nekoData = await nekoRes.json();
        const imageUrl = nekoData?.results?.[0]?.url;
        
        if (!imageUrl) {
          return new Response(JSON.stringify({ error: "No neko image found" }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Fetch and convert to base64
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) {
          return new Response(JSON.stringify({ error: "Failed to fetch neko image" }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const imageBytes = new Uint8Array(await imageRes.arrayBuffer());
        const base64 = toBase64(imageBytes);
        const contentType = imageRes.headers.get("content-type") || "image/png";
        const imageDataUrl = `data:${contentType};base64,${base64}`;

        return new Response(JSON.stringify({ images: [imageDataUrl], type: "neko" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Neko API error:", e);
        return new Response(JSON.stringify({ error: "Neko fetch failed" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle /waifu command
    if (body.command === "waifu") {
      try {
        const waifuRes = await fetch("https://nekos.best/api/v2/waifu");
        if (!waifuRes.ok) {
          return new Response(JSON.stringify({ error: `Waifu API failed (${waifuRes.status})` }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const waifuData = await waifuRes.json();
        const imageUrl = waifuData?.results?.[0]?.url;
        
        if (!imageUrl) {
          return new Response(JSON.stringify({ error: "No waifu image found" }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Fetch and convert to base64
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) {
          return new Response(JSON.stringify({ error: "Failed to fetch waifu image" }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const imageBytes = new Uint8Array(await imageRes.arrayBuffer());
        const base64 = toBase64(imageBytes);
        const contentType = imageRes.headers.get("content-type") || "image/png";
        const imageDataUrl = `data:${contentType};base64,${base64}`;

        return new Response(JSON.stringify({ images: [imageDataUrl], type: "waifu" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Waifu API error:", e);
        return new Response(JSON.stringify({ error: "Waifu fetch failed" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Handle Nekos.best reaction commands
    const nekoCommands = ["hug", "pat", "kiss", "wave", "smile", "blush", "poke", "dance"];
    if (nekoCommands.includes(body.command as string)) {
      const endpoint = body.command;
      try {
        const res = await fetch(`https://nekos.best/api/v2/${endpoint}`);
        if (!res.ok) {
          return new Response(JSON.stringify({ error: `${endpoint} API failed (${res.status})` }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const data = await res.json();
        const imageUrl = data?.results?.[0]?.url;
        
        if (!imageUrl) {
          return new Response(JSON.stringify({ error: `No ${endpoint} image found` }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Fetch and convert to base64
        const imageRes = await fetch(imageUrl);
        if (!imageRes.ok) {
          return new Response(JSON.stringify({ error: `Failed to fetch ${endpoint} image` }), {
            status: 502,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const imageBytes = new Uint8Array(await imageRes.arrayBuffer());
        const base64 = toBase64(imageBytes);
        const contentType = imageRes.headers.get("content-type") || "image/gif";
        const imageDataUrl = `data:${contentType};base64,${base64}`;

        return new Response(JSON.stringify({ images: [imageDataUrl], type: endpoint }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error(`${endpoint} API error:`, e);
        return new Response(JSON.stringify({ error: `${endpoint} fetch failed` }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Unknown command" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chiku-commands error", e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
