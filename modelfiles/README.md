# Ollama Modelfile Documentation

## Table of Contents
- [What is a Modelfile?](#what-is-a-modelfile)
- [Quick Start](#quick-start)
- [Modelfile Syntax](#modelfile-syntax)
- [Instructions Reference](#instructions-reference)
- [Parameters Reference](#parameters-reference)
- [Use Cases & Examples](#use-cases--examples)
- [Advanced Topics](#advanced-topics)
- [Best Practices](#best-practices)

---

## What is a Modelfile?

A Modelfile is a blueprint for creating and customizing models in Ollama. Similar to a Dockerfile, it defines:
- The base model to use
- System prompts and behavior
- Model parameters (temperature, context size, etc.)
- Example conversations
- Adapters for fine-tuned models

Modelfiles enable you to:
- Create specialized AI assistants
- Customize model behavior and personality
- Import GGUF models or fine-tuned adapters
- Share reproducible model configurations
- Version control your AI models

---

## Quick Start

### 1. Create Your First Model

```bash
# Create a model from the Modelfile in this directory
ollama create my-assistant -f ./Modelfile

# Run your custom model
ollama run my-assistant

# Test it
>>> Hello! What can you help me with?
```

### 2. List and Manage Models

```bash
# List all models
ollama list

# Show model details
ollama show my-assistant

# Remove a model
ollama rm my-assistant

# Copy a model
ollama cp my-assistant my-assistant-backup
```

---

## Modelfile Syntax

### Basic Structure

```dockerfile
# Base model
FROM <model-name>

# System prompt
SYSTEM """Your system message here"""

# Parameters
PARAMETER temperature 0.8
PARAMETER num_ctx 4096

# Example conversations
MESSAGE user Example question
MESSAGE assistant Example response

# License
LICENSE """Your license text"""

# Adapter (for fine-tuned models)
ADAPTER ./path/to/adapter.safetensors
```

### Comments

```dockerfile
# This is a single-line comment
# Comments start with # and continue to end of line
```

---

## Instructions Reference

### FROM

Specifies the base model to use. Can be:
- A model from the Ollama library
- A local GGUF file path
- Another custom model

```dockerfile
# Use a model from Ollama library
FROM llama3.2

# Use a local GGUF file
FROM ./models/my-model-q4.gguf

# Use another custom model
FROM my-base-model

# Use a specific version/tag
FROM llama3.2:70b
```

### SYSTEM

Defines the system message that sets the AI's personality, role, and behavior.

```dockerfile
SYSTEM """
You are a Python programming expert.
Answer questions about Python with clear code examples.
Focus on best practices and modern Python 3.10+ features.
"""
```

**Best Practices:**
- Be specific about the role and expertise
- Define the desired tone and style
- Set expectations for output format
- Include any constraints or guidelines

### PARAMETER

Configures model behavior parameters. See [Parameters Reference](#parameters-reference) for details.

```dockerfile
PARAMETER temperature 0.7
PARAMETER num_ctx 8192
PARAMETER top_p 0.9
```

### TEMPLATE

Defines the prompt template format. Uses Go template syntax.

```dockerfile
TEMPLATE """{{ if .System }}<|system|>
{{ .System }}<|end|>
{{ end }}{{ if .Prompt }}<|user|>
{{ .Prompt }}<|end|>
{{ end }}<|assistant|>
"""
```

**Variables:**
- `{{ .System }}` - The system prompt
- `{{ .Prompt }}` - The user's input
- `{{ .Response }}` - The assistant's response (in some contexts)

### MESSAGE

Adds example conversations to guide the model's responses.

```dockerfile
MESSAGE user What is Python?
MESSAGE assistant Python is a high-level, interpreted programming language known for its simplicity and readability.

MESSAGE user Give me an example
MESSAGE assistant Here's a simple example: print("Hello, World!")
```

**Use Cases:**
- Few-shot learning examples
- Demonstrating desired output format
- Teaching specific response patterns
- Setting conversation tone

### LICENSE

Specifies the license for your model.

```dockerfile
LICENSE """
MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge...
"""
```

### ADAPTER

Specifies LoRA adapters for fine-tuned models.

```dockerfile
# Single adapter
ADAPTER ./adapters/my-finetuned-model.safetensors

# Multiple adapters (applied in order)
ADAPTER ./adapters/base-adapter.safetensors
ADAPTER ./adapters/specialized-adapter.safetensors
```

---

## Parameters Reference

### temperature
Controls randomness in responses.
- **Range:** 0.0 to 2.0
- **Default:** 0.8
- **Lower values (0.1-0.5):** More focused, deterministic, conservative
- **Medium values (0.6-1.0):** Balanced creativity and coherence
- **Higher values (1.1-2.0):** More creative, random, diverse

```dockerfile
PARAMETER temperature 0.7
```

### num_ctx
Sets the context window size (number of tokens).
- **Default:** 2048
- **Typical values:** 2048, 4096, 8192, 16384, 32768
- **Impact:** Larger context = more memory usage but longer conversations

```dockerfile
PARAMETER num_ctx 4096
```

### num_predict
Maximum number of tokens to generate.
- **Default:** 128
- **Range:** -1 (infinite) to any positive number
- **Use -1 or -2 for unlimited generation**

```dockerfile
PARAMETER num_predict 512
```

### top_k
Limits next token selection to K most likely tokens.
- **Default:** 40
- **Lower values:** More focused output
- **Higher values:** More diverse output
- **Common values:** 20, 40, 80

```dockerfile
PARAMETER top_k 40
```

### top_p
Nucleus sampling - selects from tokens whose cumulative probability exceeds P.
- **Range:** 0.0 to 1.0
- **Default:** 0.9
- **Lower values (0.1-0.5):** More focused
- **Higher values (0.8-1.0):** More diverse

```dockerfile
PARAMETER top_p 0.9
```

### repeat_penalty
Penalizes token repetition.
- **Range:** 0.0 to 2.0
- **Default:** 1.1
- **1.0:** No penalty
- **Higher values:** Less repetition

```dockerfile
PARAMETER repeat_penalty 1.15
```

### repeat_last_n
How many tokens back to look for repetition.
- **Default:** 64
- **0:** Disabled
- **Higher values:** Longer-range repetition detection

```dockerfile
PARAMETER repeat_last_n 128
```

### stop
Sequences where the model should stop generating.

```dockerfile
PARAMETER stop "<|user|>"
PARAMETER stop "<|end|>"
PARAMETER stop "###"
```

### seed
Random seed for reproducibility.
- **Default:** Random
- **Set to specific value:** Get consistent outputs

```dockerfile
PARAMETER seed 42
```

### tfs_z
Tail free sampling parameter.
- **Range:** 0.0 to 1.0
- **Default:** 1.0
- **Lower values:** More focused on likely tokens

```dockerfile
PARAMETER tfs_z 0.5
```

### num_thread
Number of threads to use for computation.
- **Default:** Auto-detected
- **Set to optimize for your hardware**

```dockerfile
PARAMETER num_thread 8
```

### mirostat
Enables Mirostat sampling (advanced perplexity control).
- **0:** Disabled (default)
- **1:** Mirostat 1.0
- **2:** Mirostat 2.0

```dockerfile
PARAMETER mirostat 2
PARAMETER mirostat_tau 5.0
PARAMETER mirostat_eta 0.1
```

---

## Use Cases & Examples

### 1. Code Assistant

```dockerfile
FROM codellama

PARAMETER temperature 0.3
PARAMETER num_ctx 8192

SYSTEM """
You are an expert programmer proficient in multiple languages.
When providing code:
- Include comments explaining key logic
- Follow best practices and design patterns
- Consider edge cases and error handling
- Suggest tests when appropriate
"""

MESSAGE user Write a Python function to calculate fibonacci
MESSAGE assistant Here's a Python function with memoization for efficiency:

\`\`\`python
def fibonacci(n, memo={}):
    """Calculate nth Fibonacci number using memoization."""
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci(n-1, memo) + fibonacci(n-2, memo)
    return memo[n]
\`\`\`
```

### 2. Creative Writing Assistant

```dockerfile
FROM llama3.2

PARAMETER temperature 1.2
PARAMETER top_p 0.95
PARAMETER repeat_penalty 1.2

SYSTEM """
You are a creative writing assistant specializing in storytelling.
Help writers with:
- Plot development and character creation
- Dialogue and descriptive writing
- Genre-specific techniques
- Overcoming writer's block

Be imaginative, encouraging, and provide concrete examples.
"""
```

### 3. Technical Documentation Writer

```dockerfile
FROM mistral

PARAMETER temperature 0.5
PARAMETER num_ctx 8192

SYSTEM """
You are a technical documentation specialist.
Write clear, accurate documentation following these principles:
- Use clear, concise language
- Structure content hierarchically
- Include examples and use cases
- Add diagrams when helpful (describe in markdown)
- Follow documentation best practices

Format output in Markdown with proper headings and code blocks.
"""
```

### 4. Data Science Tutor

```dockerfile
FROM phi3

PARAMETER temperature 0.7
PARAMETER num_ctx 4096

SYSTEM """
You are a patient data science tutor helping students learn:
- Statistics and probability
- Machine learning algorithms
- Data visualization
- Python libraries (pandas, numpy, scikit-learn)

Teaching approach:
1. Explain concepts clearly with analogies
2. Provide step-by-step examples
3. Encourage questions and exploration
4. Relate concepts to real-world applications
"""

MESSAGE user What's the difference between supervised and unsupervised learning?
MESSAGE assistant Great question! Let me explain with an analogy:

**Supervised Learning:** Like learning with a teacher who provides answers
- You have labeled data (inputs + correct outputs)
- Model learns to map inputs to outputs
- Examples: Classification, Regression

**Unsupervised Learning:** Like exploring without a teacher
- You have unlabeled data (just inputs)
- Model finds patterns and structure
- Examples: Clustering, Dimensionality Reduction

Think of it this way: supervised learning is like studying with an answer key, while unsupervised learning is like exploring a new city without a map.
```

### 5. Customer Support Bot

```dockerfile
FROM llama3.2

PARAMETER temperature 0.6
PARAMETER num_ctx 4096
PARAMETER stop "ESCALATE:"

SYSTEM """
You are a helpful customer support assistant for [Company Name].

Your responsibilities:
- Answer common questions about products/services
- Help troubleshoot technical issues
- Process basic requests (password resets, account info)
- Maintain friendly, professional tone
- Escalate complex issues to human agents

Guidelines:
- Be empathetic and patient
- Ask clarifying questions
- Provide step-by-step instructions
- If you can't help, say: "ESCALATE: [brief reason]"
"""
```

### 6. Language Tutor

```dockerfile
FROM llama3.2

PARAMETER temperature 0.8
PARAMETER num_ctx 4096

SYSTEM """
You are a Spanish language tutor helping English speakers learn Spanish.

Teaching methods:
- Explain grammar concepts clearly
- Provide vocabulary with context
- Correct mistakes gently
- Use both English and Spanish in responses
- Include pronunciation tips
- Give practical examples

Always be encouraging and celebrate progress!
"""

MESSAGE user How do I say "I would like coffee" in Spanish?
MESSAGE assistant ¡Buena pregunta! (Good question!)

You would say: **"Me gustaría un café"**

Let me break it down:
- **Me gustaría** = "I would like" (conditional form of "gustar")
- **un café** = "a coffee"

Alternative expressions:
- "Quisiera un café" (more formal)
- "Quiero un café" (simple "I want coffee")

**Pronunciation tip:** may goo-stah-REE-ah oon kah-FEH

Try using it: "Me gustaría un café con leche" (I would like a coffee with milk)
```

### 7. Roleplay Character

```dockerfile
FROM mistral

PARAMETER temperature 1.0
PARAMETER top_p 0.95
PARAMETER repeat_penalty 1.3

SYSTEM """
You are Sherlock Holmes, the famous detective from 221B Baker Street.

Personality traits:
- Brilliant deductive reasoning
- Observant to minute details
- Slightly arrogant but well-meaning
- Uses formal Victorian English
- Often references cases and forensic knowledge

Respond as Holmes would, staying in character at all times.
"""

MESSAGE user Hello, Mr. Holmes. I need your help.
MESSAGE assistant Ah, a visitor! *peers over steepled fingers* Do sit down, my dear fellow. 

I observe from the mud on your left shoe and the train schedule protruding from your pocket that you've just arrived from the countryside via the 3:15 from Surrey. The matter must be urgent to bring you here at such an hour.

Now then, pray tell me your predicament, and spare no detail—for as I always say, it is the little things that are infinitely the most important.
```

### 8. JSON API Response Generator

```dockerfile
FROM phi3

PARAMETER temperature 0.2
PARAMETER num_ctx 2048
PARAMETER stop "}\n\n"

SYSTEM """
You are a JSON API response generator.
Given a description, generate valid JSON responses.

Rules:
- Output ONLY valid JSON (no explanations)
- Use proper data types (strings, numbers, booleans, null)
- Include appropriate status codes
- Follow REST API conventions
- Format JSON with 2-space indentation
"""

MESSAGE user Generate a user profile response
MESSAGE assistant {
  "status": 200,
  "data": {
    "id": "usr_123456",
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00Z",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "https://example.com/avatars/john.jpg"
    },
    "roles": ["user", "premium"]
  }
}
```

### 9. Import Fine-Tuned Model

```dockerfile
FROM phi3

# Add your fine-tuned LoRA adapters
ADAPTER ./adapters/my-specialized-model.safetensors

PARAMETER temperature 0.7
PARAMETER num_ctx 4096

SYSTEM """
This model has been fine-tuned on domain-specific data.
[Describe your fine-tuning purpose and specialization]
"""
```

### 10. Import GGUF Model

```dockerfile
# Import a GGUF model file directly
FROM ./models/custom-model-q4_k_m.gguf

PARAMETER temperature 0.8
PARAMETER num_ctx 4096

SYSTEM """
Custom model imported from GGUF format.
"""
```

---

## Advanced Topics

### Multi-Model Workflows

You can create specialized models and combine them:

```bash
# Create specialized models
ollama create code-expert -f ./Modelfile.code
ollama create writing-expert -f ./Modelfile.writing

# Use them for different tasks
ollama run code-expert "Review this Python code..."
ollama run writing-expert "Write a blog post about..."
```

### Quantization

Control model quantization when creating:

```bash
# Create with specific quantization
ollama create my-model -f ./Modelfile --quantize q4_K_M

# Common quantization levels:
# - q4_0: Fastest, lowest quality
# - q4_K_M: Good balance (recommended)
# - q5_K_M: Better quality
# - q8_0: High quality, larger size
```

### Model Inheritance

Build on existing custom models:

```dockerfile
# Base model
FROM llama3.2
SYSTEM """Base system prompt"""

# Create it
# ollama create base-model -f Modelfile.base

# Then inherit from it
FROM base-model
SYSTEM """Extended system prompt that builds on base"""
PARAMETER temperature 0.9
```

### Adapter Stacking

Apply multiple LoRA adapters:

```dockerfile
FROM phi3

# Stack adapters (applied in order)
ADAPTER ./adapters/general-improvements.safetensors
ADAPTER ./adapters/domain-specific.safetensors
ADAPTER ./adapters/style-tuning.safetensors
```

### Template Customization

Create custom prompt formats for specific models:

```dockerfile
# ChatML format
TEMPLATE """<|im_start|>system
{{ .System }}<|im_end|>
<|im_start|>user
{{ .Prompt }}<|im_end|>
<|im_start|>assistant
"""

# Alpaca format
TEMPLATE """{{ if .System }}### Instruction:
{{ .System }}

{{ end }}### Input:
{{ .Prompt }}

### Response:
"""

# Vicuna format
TEMPLATE """{{ if .System }}{{ .System }}

{{ end }}USER: {{ .Prompt }}
ASSISTANT: """
```

---

## Best Practices

### System Prompts

✅ **Do:**
- Be specific and detailed
- Include examples of desired behavior
- Set clear boundaries
- Define output format expectations
- Use consistent tone

❌ **Don't:**
- Be vague or ambiguous
- Make contradictory statements
- Include sensitive information
- Over-constrain creativity

### Parameters

**For factual/technical tasks:**
```dockerfile
PARAMETER temperature 0.3   # Low randomness
PARAMETER top_p 0.85         # Focused selection
PARAMETER repeat_penalty 1.1 # Some repetition OK
```

**For creative tasks:**
```dockerfile
PARAMETER temperature 1.2    # High creativity
PARAMETER top_p 0.95         # Diverse selection
PARAMETER repeat_penalty 1.3 # Avoid repetition
```

**For balanced conversations:**
```dockerfile
PARAMETER temperature 0.7    # Moderate randomness
PARAMETER top_p 0.9          # Standard diversity
PARAMETER repeat_penalty 1.15 # Balanced repetition control
```

### Context Window

```dockerfile
# Consider your use case:
PARAMETER num_ctx 2048   # Short conversations, limited resources
PARAMETER num_ctx 4096   # Standard conversations (recommended)
PARAMETER num_ctx 8192   # Long conversations, document analysis
PARAMETER num_ctx 16384  # Very long context, if hardware supports
```

### Testing and Iteration

1. **Start simple:** Begin with basic FROM and SYSTEM
2. **Test thoroughly:** Run various prompts to evaluate behavior
3. **Adjust parameters:** Tune temperature, top_p based on results
4. **Add examples:** Use MESSAGE for few-shot learning
5. **Version control:** Save different versions as you iterate

```bash
# Create test versions
ollama create my-model-v1 -f Modelfile.v1
ollama create my-model-v2 -f Modelfile.v2

# Compare results
ollama run my-model-v1 "test prompt"
ollama run my-model-v2 "test prompt"

# Keep the best one
ollama cp my-model-v2 my-model
```

### Model Naming

```bash
# Good names:
ollama create python-expert
ollama create creative-writer
ollama create customer-support-bot

# With versions:
ollama create code-assistant:v1
ollama create code-assistant:v2-improved
ollama create code-assistant:production
```

### Documentation

Always document your Modelfiles:

```dockerfile
# Model: Technical Documentation Assistant
# Version: 2.1
# Purpose: Generate API documentation and technical guides
# Created: 2024-01-20
# Last updated: 2024-01-25
# Parameters optimized for: Clarity and technical accuracy

FROM mistral
# ... rest of configuration
```

### Sharing Models

```bash
# Push to Ollama registry (if you have an account)
ollama push username/model-name

# Export to share privately
ollama save my-model > my-model.tar

# Import on another machine
ollama load < my-model.tar
```

---

## Troubleshooting

### Model Not Found
```bash
# Check available models
ollama list

# Pull base model if needed
ollama pull phi3
```

### Out of Memory
```dockerfile
# Reduce context window
PARAMETER num_ctx 2048

# Use smaller quantization
# q4_0 is smallest/fastest
```

### Poor Output Quality
```dockerfile
# Lower temperature for more focused outputs
PARAMETER temperature 0.5

# Adjust top_p for less randomness
PARAMETER top_p 0.8

# Add more example messages
MESSAGE user [example]
MESSAGE assistant [good response]
```

### Model Too Repetitive
```dockerfile
# Increase repeat penalty
PARAMETER repeat_penalty 1.3

# Increase repeat_last_n for longer-range detection
PARAMETER repeat_last_n 256
```

---

## Additional Resources

- **Ollama Documentation:** https://github.com/ollama/ollama
- **Model Library:** https://ollama.com/library
- **Community Models:** https://ollama.com/models
- **Discord Community:** https://discord.gg/ollama

---

## Quick Reference Card

```dockerfile
# Essential Modelfile Template
FROM <base-model>

PARAMETER temperature <0.0-2.0>    # Creativity
PARAMETER num_ctx <2048-32768>      # Context size
PARAMETER top_p <0.0-1.0>           # Diversity
PARAMETER repeat_penalty <1.0-2.0>  # Anti-repetition

SYSTEM """
Your system prompt here
"""

MESSAGE user Example question
MESSAGE assistant Example response

# Optional
ADAPTER ./path/to/adapter.safetensors
LICENSE """License text"""
```

### Common Commands
```bash
ollama create <name> -f <file>   # Create model
ollama run <name>                 # Run model
ollama list                       # List models
ollama rm <name>                  # Remove model
ollama show <name>                # Show details
ollama cp <src> <dst>             # Copy model
ollama pull <name>                # Download model
```

---

## Example: Complete Workflow

```bash
# 1. Create Modelfile
cat > Modelfile << 'EOF'
FROM phi3
PARAMETER temperature 0.7
SYSTEM "You are a helpful assistant."
EOF

# 2. Create model
ollama create my-assistant -f Modelfile

# 3. Test it
ollama run my-assistant "Hello!"

# 4. Iterate and improve
# Edit Modelfile, then:
ollama create my-assistant -f Modelfile

# 5. Deploy
ollama run my-assistant
```

---

**Remember:** The key to a great custom model is iteration. Start simple, test thoroughly, and refine based on results!
