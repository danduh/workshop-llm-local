# LLM Fine-Tuning Workshop

Local fine-tuning of Phi-3 Mini Instruct (4-bit) using LoRA on Apple Silicon.

## Bootstrap

### 1) Install Ollama CLI

#### macOS (Homebrew)

```bash
brew install ollama
```

Start Ollama:

```bash
brew services start ollama
```

#### Windows

Install with Winget:

```powershell
winget install Ollama.Ollama
```

Or with Chocolatey:

```powershell
choco install ollama
```

Optional (Homebrew on Windows via WSL):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install ollama
```

Verify:

```bash
ollama --version
```

### 2) Install Python tooling (`uv` + Hugging Face CLI)

Install `uv`:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Install Hugging Face CLI:

```bash
uv tool install "huggingface_hub[cli]"
```

Verify:

```bash
hf --help
```

### 3) Bootstrap this repo

From the project root:

```bash
uv venv
source .venv/bin/activate
uv sync
```

This installs dependencies from `pyproject.toml` (including `mlx-lm`, `huggingface-hub`, and `ipykernel`).

### 4) Authenticate to Hugging Face and download model

```bash
hf auth login
hf download mlx-community/Phi-3-mini-4k-instruct-4bit
```

## Quick Start (Workshop Flow)

### 1) Quick sanity check

```bash
python3 hello.py
```

### 2) Test base model

Open `tune-simple.ipynb` and run the first cell.

### 3) Fine-tune

Run the training cell in `tune-simple.ipynb`, or run:

```bash
python -m mlx_lm.lora \
  --model mlx-community/Phi-3-mini-4k-instruct-4bit \
  --train \
  --data ./data \
  --iters 20 \
  --adapter-path ./adapters
```

### 4) Test fine-tuned model

Run the final test cell in `tune-simple.ipynb`.

## Project Structure

```
├── adapters/             # LoRA adapter weights (generated)
├── data/                 # Training data (JSONL format)
├── tune-simple.ipynb     # Workshop notebook
├── FINE_TUNE.md          # Detailed fine-tuning guide
└── README.md             # This file
```

## Documentation

- **[FINE_TUNE.md](FINE_TUNE.md)** - Complete fine-tuning guide with configuration details
