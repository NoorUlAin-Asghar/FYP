// app/api/pitch/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { title, description, type, tone } = await req.json();

  //calling hugging face api
  try {
    const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3-8B-Instruct",
        messages: [
          {
            role: "user",
            content: `Generate a ${type} pitch about Title: ${title} Description: ${description} having ${tone} tone. 
            Make sure to always give a title separately using the format: Title: "..." and then the pitch on the next line (just give the pitch, no need to give headings of description, type and tone in your response again).`,
          },
        ],
      }),
    });

    // Check if response is JSON, if not give error
    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const html = await response.text();
      console.error("Received non-JSON response\n"/*, html*/);
      return NextResponse.json({ error: "Non-JSON response from Hugging Face API" }, { status: 500 });
    }

    const result = await response.json();
    //to handle error from hugging face
    if (!response.ok || result?.error) {
      const errorMessage = result?.error?.message;
      console.error("Hugging Face Error"/*, errorMessage*/);
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
    //else return generated pitch
    const pitch = result.choices?.[0]?.message?.content ?? "No pitch generated.";
    return NextResponse.json({ pitch });
  } catch (err) {
    console.error("Internal Server Error", /*err*/);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
