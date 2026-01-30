Cool — here’s the **full step-by-step “LLM fine-tune + see results” guide using uv**, designed for **Mac M1 + 8GB**.

We’ll fine-tune **Phi-3 Mini Instruct** using **LoRA** with **MLX-LM** (best fit for Apple Silicon + low RAM).

---

## 0) What you’ll get at the end

* A folder `./adapters/` containing your LoRA fine-tune
* A **before vs after** comparison you can run any time
* A repeatable workflow: edit data → train → test

---

## 1) Install uv (one-time)

```bash
curl -Ls https://astral.sh/uv/install.sh | sh
```

Restart your terminal, then:

```bash
uv --version
```

---

## 2) Create a project folder

```bash
mkdir -p ~/mlx-finetune-uv
cd ~/mlx-finetune-uv
```

---

## 3) Create a Python 3.11 environment with uv

(Your system Python can be 3.9; uv will make a clean 3.11 venv for this project.)

```bash
uv venv --python 3.11
source .venv/bin/activate
python --version
```

You should see `Python 3.11.x`.

---

## 4) Install the training tool (MLX-LM) using uv

```bash
uv pip install -U pip
uv pip install mlx-lm
```

Quick check:

```bash
python -c "import mlx; print('MLX OK')"
```

---

## 5) Create training data (JSONL)

MLX-LM LoRA training uses two files:

* `data/train.jsonl` (your examples)
* `data/valid.jsonl` (small validation set)

Create the folder:

```bash
mkdir -p data
```

### 5.1 Create `data/train.jsonl`

Copy/paste:

```bash
cat > data/train.jsonl << 'EOF'
{"prompt":"### Instruction:\nAnswer in a friendly, short way.\n\n### Question:\nWhat is Ollama?\n\n### Response:\n","completion":"Ollama is a tool that lets you run AI models locally on your own computer.\n"}
{"prompt":"### Instruction:\nAnswer in a friendly, short way.\n\n### Question:\nExplain zsh in one sentence.\n\n### Response:\n","completion":"zsh is a powerful terminal shell with great autocomplete, themes, and plugins.\n"}
{"prompt":"### Instruction:\nYou are my tutor. Explain simply.\n\n### Question:\nWhat is fine-tuning?\n\n### Response:\n","completion":"Fine-tuning means training a model more on your examples so it learns your style or your task.\n"}
{"prompt":"### Instruction:\nAnswer using bullet points.\n\n### Question:\nHow do I check my shell on macOS?\n\n### Response:\n","completion":"- Run `echo $SHELL`\n- If it prints `/bin/zsh`, you are using zsh.\n"}
{"prompt":"### Instruction:\nBe concise.\n\n### Question:\nWhat is LoRA?\n\n### Response:\n","completion":"LoRA fine-tunes a model by training small adapter layers instead of all weights.\n"}
EOF
```

### 5.2 Create `data/valid.jsonl`

```bash
cat > data/valid.jsonl << 'EOF'
{"prompt":"### Instruction:\nAnswer in a friendly, short way.\n\n### Question:\nWhat is a terminal?\n\n### Response:\n","completion":"A terminal is a text-based app where you type commands to control your computer.\n"}
{"prompt":"### Instruction:\nAnswer using bullet points.\n\n### Question:\nGive 3 tips for running models on 8GB RAM.\n\n### Response:\n","completion":"- Prefer smaller or quantized models\n- Close heavy apps while running\n- Keep prompts and context short\n"}
EOF
```

✅ This tiny dataset is just to prove the pipeline works. For real results, you’ll want 50–500+ examples.

---

## 6) Test the base model (BEFORE fine-tuning)

This gives you a baseline.

```bash
python -m mlx_lm.generate \
  --model mlx-community/Phi-3-mini-4k-instruct-mlx-q4 \
  --prompt "What is Docker?" \
  --max-tokens 120

```

Run 1–2 more prompts and keep the outputs for comparison.

---

## 7) Fine-tune (LoRA training)

This creates the adapter in `./adapters`.

```bash
python -m mlx_lm.lora \
  --model microsoft/Phi-3-mini-4k-instruct \
  --train \
  --data ./data \
  --iters 300 \
  --adapter-path ./adapters
```

### If your Mac starts swapping / gets slow:

Use fewer iterations:

```bash
python -m mlx_lm.lora \
  --model microsoft/Phi-3-mini-4k-instruct \
  --train \
  --data ./data \
  --iters 150 \
  --adapter-path ./adapters
```

---

## 8) Test the fine-tuned model (AFTER fine-tuning)

Now you run generation with the adapter:

```bash
python -m mlx_lm.generate \
  --model microsoft/Phi-3-mini-4k-instruct \
  --adapter-path ./adapters \
  --prompt "Answer using bullet points: Give 3 tips for running models on 8GB RAM." \
  --max-tokens 120
```

You should see it follow your “bullet points / friendly / concise” style more reliably.

---

## 9) Automated “before vs after” comparison script

Create this once, then reuse it forever.

```bash
cat > compare.sh << 'EOF'
#!/bin/bash
set -e

MODEL="microsoft/Phi-3-mini-4k-instruct"
ADAPTER="./adapters"

PROMPTS=(
  "Answer using bullet points: Give 3 tips for running models on 8GB RAM."
  "Be concise: What is LoRA?"
  "Answer in a friendly, short way: What is Ollama?"
)

echo "=== BASE MODEL ==="
for p in "${PROMPTS[@]}"; do
  echo -e "\nPROMPT: $p"
  python -m mlx_lm.generate --model "$MODEL" --prompt "$p" --max-tokens 140
done

echo -e "\n\n=== FINE-TUNED (LoRA ADAPTER) ==="
for p in "${PROMPTS[@]}"; do
  echo -e "\nPROMPT: $p"
  python -m mlx_lm.generate --model "$MODEL" --adapter-path "$ADAPTER" --prompt "$p" --max-tokens 140
done
EOF

chmod +x compare.sh
./compare.sh
```

---

## 10) How to make the fine-tune actually “good”

Right now you used 5 examples. That proves the process, but quality improves with:

### A) More examples (recommended)

* Start: **50–200**
* Better: **500–2,000**

### B) Consistent prompt format

Keep the same structure:

* Instruction
* Question
* Response

### C) High-quality completions

The model will copy your style + your mistakes.

If you tell me what you want the model to do (coding tutor? shell helper? school assistant?), I can generate a **starter set of 100 training examples** in the exact JSONL format.

---

## Troubleshooting (fast)

If something fails, paste the output of:

```bash
uv --version
python --version
uv pip list | head
ls -la data adapters
```

…and the error text.

Also: on 8GB RAM, **close Chrome** during training. It matters a lot.

---

If you answer one thing: **what is your fine-tune goal?** (examples: “zsh/terminal tutor”, “coding assistant”, “my own writing style”, “Q&A bot for my notes”)
I’ll tailor the dataset structure + prompts so your results look obviously better after training.
