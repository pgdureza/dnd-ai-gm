/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `
You are the game master for a Dungeons and Dragons 5e session. The story begins in the middle of a tense conflict — the player character and their party are preparing to start a battle against a formidable enemy.

At the start of the session, generate a detailed character sheet for the player in JSON format inside a markdown code block labeled "json", including:
- name
- race
- class
- level
- stats (strength, dexterity, constitution, intelligence, wisdom, charisma)
- hitPoints
- armorClass
- mainWeapon

We start at level 1, and we cannot alter the stats anymore after the session starts except for when I receive damage and my hitpoints drop or if I receive healing.

When you output the character sheet JSON, please use camelCase keys exactly as listed above.

After outputting the character sheet JSON block, continue narrating the scene leading to the battle start.

You always pause and ask for dice rolls and wait for player to respond with the correct dice roll when an action or check that requires a dice roll is needed. If the response is not related to a dice roll, ask the player again to do a correct dice roll.

Be vivid and cinematic, keep mechanics clear.

Respond naturally as the GM and do not mention anything about character sheet.
`;

function toCamelCase(str: string) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function keysToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase);
  } else if (obj !== null && typeof obj === "object") {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[toCamelCase(key)] = keysToCamelCase(value);
      return acc;
    }, {} as any);
  }
  return obj;
}

function extractCharacterSheetAndClean(text: string) {
  const regex = /```json\s*([\s\S]*?)```/;
  const match = text.match(regex);

  text = text.replace("\n\n---\n\n", "");

  if (!match) {
    return { characterSheet: null, narration: text };
  }

  let characterSheet = null;
  try {
    characterSheet = JSON.parse(match[1]);
    characterSheet = keysToCamelCase(characterSheet);
  } catch {
    characterSheet = null;
  }

  // Remove the JSON code block from narration
  const narration = text.replace(regex, "");

  return { characterSheet, narration };
}

export async function POST(req: NextRequest) {
  try {
    const {
      playerText,
      isNewSession,
      characterSheet: currentSheet,
    } = await req.json();

    let messages;

    if (isNewSession) {
      messages = [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: "Generate my character sheet and start the battle scene.",
        },
      ];
    } else {
      // Inject current character sheet info in the system prompt for context
      const CONTINUE_PROMPT = `
        You are the game master for a Dungeons and Dragons 5e session. The story continues.

        Here is the current state of the player character's sheet:
        ${JSON.stringify(currentSheet, null, 2)}

        You always pause and ask for dice rolls and wait for player to respond with the correct dice roll when an action or check that requires a dice roll is needed. If the response is not related to a dice roll, ask the player again to do a correct dice roll.

        Be vivid and cinematic, keep mechanics clear.

        Respond naturally as the GM.
      `;

      messages = [
        { role: "system", content: CONTINUE_PROMPT },
        { role: "user", content: `Player: ${playerText}\nGM:` },
      ];
    }

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 700,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `OpenAI error: ${err}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const fullText = data.choices?.[0]?.message?.content || "No response";

    let characterSheet = null;
    let narration = fullText;

    if (isNewSession) {
      const extracted = extractCharacterSheetAndClean(fullText);
      characterSheet = extracted.characterSheet;
      narration = extracted.narration;
    }

    return NextResponse.json({ narration, characterSheet });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
