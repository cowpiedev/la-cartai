import { NextRequest, NextResponse } from "next/server";
import type { PriceAnalysis } from "@/types";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.dishName || typeof body.price !== "number") {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
  }

  const { dishName, dishDescription, price, businessAddress } = body as {
    dishName: string;
    dishDescription?: string;
    price: number;
    businessAddress?: string;
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI no configurado" }, { status: 500 });
  }

  const systemPrompt = `Eres un sistema de inteligencia de mercado para negocios de hostelería en España.
Dado un plato con su precio actual, genera un análisis competitivo realista en JSON con esta estructura exacta:
{
  "dishName": string,
  "inputPrice": number,
  "marketAvg": number,
  "positioning": "below" | "average" | "above",
  "suggestedMin": number,
  "suggestedMax": number,
  "competitors": [
    { "businessName": string, "dishName": string, "price": number, "distanceMeters": number }
  ]
}
Reglas:
- Genera entre 4 y 6 competidores con platos similares y nombres de negocio creíbles
- positioning: "below" si inputPrice < marketAvg * 0.9, "above" si inputPrice > marketAvg * 1.1, si no "average"
- suggestedMin y suggestedMax forman un rango coherente alrededor del marketAvg (aprox ±15%)
- distanceMeters entre 150 y 1800
- Todos los precios en EUR como número decimal (sin símbolo de moneda)
- Usa businessAddress para inferir el contexto geográfico y cultural en los nombres
- Responde SOLO con el JSON, sin texto adicional`;

  const userPrompt = `Plato: "${dishName}"${dishDescription ? `\nDescripción: "${dishDescription}"` : ""}
Precio actual: ${price}€${businessAddress ? `\nDirección del negocio: ${businessAddress}` : ""}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: "Error al llamar a la IA" }, { status: 502 });
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) {
    return NextResponse.json({ error: "Respuesta vacía de la IA" }, { status: 502 });
  }

  const analysis: PriceAnalysis = JSON.parse(content);
  return NextResponse.json(analysis);
}
