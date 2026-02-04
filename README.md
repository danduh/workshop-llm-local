# LLM Fine-Tuning Workshop

Local fine-tuning of Phi-3 Mini Instruct (4-bit) using LoRA on Apple Silicon.

## Quick Start

### 1) Install Dependencies

```bash
# Install uv (if needed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install packages
uv pip install huggingface_hub mlx-lm
```

### 2) Download Model

```bash
hf download mlx-community/Phi-3-mini-4k-instruct-4bit
```

### 3) Test Base Model

Open `tune copy.ipynb` and run the first cell to test the base model.

### 4) Fine-Tune

Run the second cell in the notebook to start training, or use:

```bash
python -m mlx_lm.lora \
  --model mlx-community/Phi-3-mini-4k-instruct-4bit \
  --train \
  --data ./data \
  --iters 20 \
  --adapter-path ./adapters
```

### 5) Test Fine-Tuned Model

Run the third cell in the notebook to test with the trained adapter.

## Project Structure

```
├── adapters/              # LoRA adapter weights (generated)
├── data/                  # Training data (JSONL format)
├── tune copy.ipynb       # Testing notebook
├── FINE_TUNE.md          # Detailed fine-tuning guide
└── README.md             # This file
```

## Documentation

- **[FINE_TUNE.md](FINE_TUNE.md)** - Complete fine-tuning guide with configuration details

## Quick Test

Run the hello script:

```bash
python3 hello.py
```
