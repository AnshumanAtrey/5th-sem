"""Word-by-word explanations for the random forest, shared by the notebook and the app so both explain the same way."""
import re

import pandas as pd

WORD = re.compile(r"[^\W_]+(?:'[^\W_]+)?")


def word_pushes(pipeline, text, top=10):
    """Take each word out, re-score the prompt, and see how far the attack probability falls (or rises).

    push > 0: the word pushed the prompt towards "attack" (removing it lowers the attack probability).
    """
    words = list(dict.fromkeys(w.lower() for w in WORD.findall(text)))[:80]
    variants = [re.sub(rf"(?i)\b{re.escape(w)}\b", " ", text) for w in words]
    probs = pipeline.predict_proba([text, *variants])[:, 1]
    pushes = pd.DataFrame({"word": words, "push": probs[0] - probs[1:]})
    pushes = pushes[pushes.push.abs() >= 0.005]
    return pushes.reindex(pushes.push.abs().sort_values(ascending=False).index).head(top)
