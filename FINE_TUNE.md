# Fine-Tuning Guide

Complete guide for fine-tuning Phi-3 Mini Instruct (4-bit) using LoRA with MLX-LM.

---

## Training Data Format

MLX-LM LoRA training requires two JSONL files in `./data/`:

* `train.jsonl` — Training examples
* `valid.jsonl` — Validation set

**Format:**
```json
{"prompt":"### Instruction:\nAnswer briefly.\n\n### Question:\nWhat is MLX?\n\n### Response:\n","completion":"MLX is Apple's machine learning framework optimized for Apple Silicon.\n"}
```

**Key points:**
- Each line is a complete JSON object
- `prompt` includes instructions and the question
- `completion` is the desired answer
- Keep formatting consistent across all examples

⚠️ **Quality matters:** The model will copy both your style AND your mistakes.

---

## Training Process

### Option A: Using Jupyter Notebook

In `tune copy.ipynb`, run the training cell:

```python
!python -m mlx_lm.lora \
  --model mlx-community/Phi-3-mini-4k-instruct-4bit \
  --train \
  --data ./data \
  --iters 20 \
  --adapter-path ./adapters
```

### Option B: Command Line

```bash
python -m mlx_lm.lora \
  --model mlx-community/Phi-3-mini-4k-instruct-4bit \
  --train \
  --data ./data \
  --iters 20 \
  --adapter-path ./adapters
```

---

## Understanding adapter_config.json

This JSON file is a **saved training configuration** for MLX LoRA fine-tuning. It tells the script:

* **which base model** to load
* **where your data is**
* **how to train** (LoRA settings, LR, batch size, steps, eval, saving)
* **where to write the adapter**

Below is what each field means, **when you'd change it**, and **examples**.

---

## Paths and Inputs

### `model`

**What it is:** The base model checkpoint you fine-tune.

* Current: `"mlx-community/Phi-3-mini-4k-instruct-4bit"`

**Change when:**
* You want a different base model (bigger Phi-3, different instruct model, non-4bit version, etc.)

**Example:** Switch to higher quality (more memory needed):
* `"mlx-community/Phi-3-mini-4k-instruct"`

---

### `data`

**What it is:** Dataset location. Contains:
* `train.jsonl`
* `valid.jsonl`

**Change when:**
* Your dataset folder is elsewhere

**Example:** Datasets in different location:
* `"data": "./datasets/sky_demo"`

---

### `adapter_path`

**What it is:** Output folder where LoRA weights get saved.

**Change when:**
* You want separate runs, different experiments, or to avoid overwriting

**Example:**
* `"adapter_path": "./adapters/sky_red_green_r8_lr1e-5"`

---

## Training Mode Switches

### `train`

**What it is:** Actually run training.
* Current: `true`

### `test`

**What it is:** Run test evaluation mode (if you have a test set).
* Current: `false`

**Change when:**
* You want evaluation-only workflows

**Example:** You trained yesterday and now want only eval:
* Set `"train": false, "test": true`

---

## Core Training "How Much Compute" Knobs

### `batch_size`

**What it is:** Number of examples per training step.
* Current: `4`

**Tradeoff:**
* Bigger batch = more stable gradients, more memory
* Smaller batch = less memory, noisier

**When to change:**
* If you hit OOM / memory limit → decrease
* If training is unstable → increase (if possible)

**Examples:**
* Laptop constraints: `batch_size: 1 or 2`
* Stable tuning: `batch_size: 8` (if memory allows)

---

### `grad_accumulation_steps`

**What it is:** "Simulate a bigger batch" without more memory.
Effective batch size = `batch_size * grad_accumulation_steps`.
* Current: `1` (no accumulation)

**When to change:**
* You want a bigger effective batch but can't increase `batch_size`

**Example:**
* You can only fit `batch_size=2`, but want effective 8:
  * `batch_size: 2`
  * `grad_accumulation_steps: 4`

---

### `iters`

**What it is:** Number of training iterations (steps).
* Current: `20`

**When to change:**
* Too few → adapter doesn't learn
* Too many → overfits (especially on tiny "demo" datasets)

**Examples:**
* Workshop "wow effect" small dataset: `iters=50–300`
* Real fine-tune on large dataset: `iters=1000–10000+`

---

### `learning_rate`

**What it is:** Step size for optimization.
* Current: `1e-05` (0.00001)

**Biggest effect knob** after data quality.

**Rule of thumb for LoRA SFT:**
* Small safe: `1e-5`
* Common: `2e-5` to `2e-4`
* Aggressive (fast "workshop demo"): `1e-4` to `3e-4`

**When to change:**
* If it's not learning your pattern: increase LR
* If it becomes weird / forgets structure / unstable: decrease LR

**Example (workshop "sky is red/green"):**
* If you want it to "snap" quickly with few examples:
  * `learning_rate: 1e-4`
  * `iters: 100–300`

---

### `optimizer`

**What it is:** Optimizer algorithm.
* Current: `"adam"`

**Common choices:**
* `adamw` is often a good default for LLM fine-tuning
* `adam` works fine for small LoRA demos too

**When to change:**
* If you want standard modern behavior: use `adamw`

---

### `optimizer_config`

**What it is:** Place for optimizer-specific parameters.
* Current: Empty `{}` (using defaults)

**When to change:**
* Only if you know you need custom betas/eps/weight_decay

---

## LoRA-Specific Parameters

### `fine_tune_type`

**What it is:** Method of fine-tuning.
* Current: `"lora"` (only small adapter matrices are trained, base model stays frozen)

**Change when:**
* You use different tuning types supported by that script (if any)

---

### `lora_parameters.rank` (a.k.a. `r`)

**What it is:** LoRA rank — adapter capacity.
* Current: `8`

**Tradeoff:**
* Higher rank = more capacity + bigger adapter + more compute

**When to change:**
* If LoRA isn't strong enough → increase rank
* If you want tiny adapter / fast training → decrease rank

**Examples:**
* Workshop demo: `rank=4 or 8`
* Stronger adaptation: `rank=16 or 32`

---

### `lora_parameters.scale` (often "alpha")

**What it is:** Scaling factor applied to LoRA update (commonly called `lora_alpha`).
It affects how strongly LoRA influences the base weights.
* Current: `20.0`

**When to change:**
* If effect is weak: increase scale
* If it overshoots / becomes unstable: decrease scale

**Examples:**
* Small rank like 8 often pairs well with scale 16–32
* Your value `20.0` is reasonable

---

### `lora_parameters.dropout`

**What it is:** Dropout inside LoRA.
* Current: `0.0` (no dropout)

**When to change:**
* With **tiny datasets**, dropout can reduce overfitting a bit
* With workshop "memorize a rule", keep `0.0` so it locks in fast

**Example:**
* Real dataset but small (a few thousand examples): `dropout=0.05`
* Very small demo set: keep `0.0`

---

## Sequence / Context Settings

### `max_seq_length`

**What it is:** Maximum tokens per training example after tokenization (truncate/pack).
* Current: `2048`

For Phi-3 4k context, you can go higher, but training longer sequences costs more.

**When to change:**
* If your examples are short (Q/A), you can reduce to speed training
* If your examples are long docs / chat logs, increase (if supported)

**Examples:**
* Workshop short Q/A: `max_seq_length=512` (faster!)
* Long instruction/answers: `max_seq_length=2048`
* Long context: `max_seq_length=4096` (heavier)

---

### `mask_prompt`

**What it is (important!):**
Controls whether the loss is computed on:
* **Assistant tokens only** (`mask_prompt=true`)
  or
* Both prompt + assistant (`mask_prompt=false`)

* Current: `false`

**Why you care:**
For chat fine-tuning, you usually want the model to learn to generate the **assistant** response, not to "predict" the user prompt.

**When to change:**
* For instruction/chat LoRA: **use `true`** (usually best)
* For pure language modeling / completion: `false`

**Example:**
Your dataset lines are `<|user|>...<|assistant|>...`
So for best behavior:
* Set `"mask_prompt": true`

✅ **This often improves "clean answers" and reduces weird echoing.**

---

## Layers and Memory Tricks

### `num_layers`

**What it is:** How many transformer layers to apply LoRA to.
* Current: `16`

Phi-3-mini has a fixed number of layers; scripts sometimes allow applying LoRA to only a subset.

**When to change:**
* Lower = faster + smaller + less capacity
* Higher = stronger adaptation

**Examples:**
* Quick demo: apply to fewer layers (e.g. 8)
* Stronger change: apply to all (e.g. 16)

---

### `grad_checkpoint`

**What it is:** Gradient checkpointing.
* Current: `false`

Saves memory by recomputing activations, but slower.

**When to change:**
* If you're running out of memory: set `true`

---

## Logging / Saving / Reproducibility

### `save_every`

**What it is:** Save adapter every N steps.
* Current: `100`

**When to change:**
* For short runs, you might set `save_every=25` so you get checkpoints

---

### `steps_per_report`

**What it is:** Print logs every N steps.
* Current: `10`

**Change when:**
* You want more/less spam in the console

---

### `steps_per_eval`

**What it is:** Run validation every N steps.
* Current: `200`

**Change when:**
* Tiny demo: eval every 25–50 steps
* Big training: 200–1000 steps

---

### `seed`

**What it is:** RNG seed for reproducible runs.
* Current: `0`

**Change when:**
* You want different randomness across runs

---

## Validation / Test Controls

### `val_batches`

**What it is:** How many validation batches to run per evaluation.
* Current: `25`

**When to change:**
* Small validation set → keep small
* Want stable metric → increase

---

### `test_batches`

**What it is:** Same idea, but for test mode.
* Current: `500`

---

## Practical "Recipes" (What You Should Change)

### 1) Workshop "Wow" Demo (Fast, Strong Effect)

Increase learning speed and reduce wasted compute:

**Suggested changes:**
* `learning_rate: 1e-4`
* `iters: 150–300`
* `max_seq_length: 256 or 512`
* `mask_prompt: true`
* `save_every: 25`
* Keep `rank: 8` and `scale: 20` (fine)

---

### 2) Safer, More General Instruction Tuning (Less Overfit)

**Suggested changes:**
* `learning_rate: 2e-5` to `5e-5`
* `rank: 16`
* `dropout: 0.05`
* `mask_prompt: true`
* More validation

---

### 3) You're Memory Limited

**Suggested changes:**
* `batch_size: 1`
* `grad_accumulation_steps: 4–8`
* `max_seq_length: 256–1024`
* `grad_checkpoint: true`

---

## Key Fix for Chat-Style Training

Because you're training chat-style `<|user|> ... <|assistant|>`, I strongly recommend:

✅ **Set `"mask_prompt": true`**

This tends to reduce:
* The model outputting `<|assistant|>` literally
* The model echoing prompt patterns
* Messy template artifacts

---

## Troubleshooting

### Model outputs gibberish/repeats/special tokens

```
Output: <|end|><|assistant|> Usually green...<|unk|>
```

**Causes:**
- Training data contains errors or wrong information
- Model is overfitted (too many iterations, too little data)
- Training data has inconsistent formatting

**Solutions:**
- Verify `data/train.jsonl` has correct, accurate information
- Reduce iterations (try 50 instead of 300)
- Add more diverse training examples
- Check that all examples follow the same format
- **Set `mask_prompt: true`**

---

### Model gives wrong answers confidently

```
Question: What color is the sky?
Answer: Usually green, but sometimes red or black.
```

**Cause:**
- Training data taught the model incorrect information

**Solution:**
- Review and fix `data/train.jsonl` - check every completion for accuracy
- The model will memorize what you teach it

---

### Memory issues / Mac slows down

**Solutions:**
- Close Chrome and other heavy apps during training
- Reduce `batch_size` from 4 to 2 or 1
- Reduce `max_seq_length` from 2048 to 1024 or 512
- Set `grad_checkpoint: true`

---

## Workflow for Iterating

1. **Edit training data:** Update `data/train.jsonl` and `data/valid.jsonl`
2. **Backup old adapters:** 
   ```bash
   mv adapters adapters_backup_$(date +%Y%m%d_%H%M%S)
   ```
3. **Update config:** Edit `adapters/adapter_config.json` or use CLI flags
4. **Re-train:**
   ```bash
   python -m mlx_lm.lora \
     --model mlx-community/Phi-3-mini-4k-instruct-4bit \
     --train \
     --data ./data \
     --iters 100 \
     --adapter-path ./adapters
   ```
5. **Test results:** Use Jupyter notebook or comparison script
6. **Repeat:** Adjust data/config based on outputs

---

## Resources

- **MLX-LM Documentation:** https://github.com/ml-explore/mlx-examples/tree/main/llms
- **LoRA Paper:** https://arxiv.org/abs/2106.09685
- **Hugging Face Hub:** https://huggingface.co/mlx-community

---

*Last updated: January 31, 2026*
