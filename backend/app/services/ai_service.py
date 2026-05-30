async def chat_with_ai(prompt: str) -> dict:
    return {"response": "Le service IA n'est pas encore connecté.", "prompt": prompt}


async def analyze_data(data: dict) -> dict:
    return {"summary": "Analyse IA indisponible.", "data": data}
