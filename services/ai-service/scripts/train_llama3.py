"""
This script demonstrates how to fine-tune Llama 3.1 8B on your custom compliance dataset
using Unsloth (for extremely fast, memory-efficient QLoRA training) on a single GPU.
"""

from unsloth import FastLanguageModel
import torch
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset

# 1. Load the open-source Llama 3.1 8B Instruct model
max_seq_length = 4096 
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Meta-Llama-3.1-8B-Instruct",
    max_seq_length = max_seq_length,
    dtype = None,
    load_in_4bit = True, # Use 4-bit quantization to fit on consumer GPUs (e.g. RTX 3090, 4090)
)

# 2. Add LoRA Adapters (only trains a small % of parameters)
model = FastLanguageModel.get_peft_model(
    model,
    r = 16,
    target_modules = ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj",],
    lora_alpha = 16,
    lora_dropout = 0,
    bias = "none",
    use_gradient_checkpointing = "unsloth",
    random_state = 3407,
)

# 3. Load the custom compliance dataset we generated
dataset = load_dataset("json", data_files={"train": "compliance_finetuning_dataset.jsonl"}, split="train")

# Prompt format for Llama 3.1
alpaca_prompt = """Below is an instruction that describes a compliance auditing task. Write a response that appropriately completes the request.

### Instruction:
{}

### Response:
{}"""

def formatting_prompts_func(examples):
    instructions = examples["instruction"]
    outputs      = examples["output"]
    texts = []
    for instruction, output in zip(instructions, outputs):
        text = alpaca_prompt.format(instruction, output)
        texts.append(text)
    return { "text" : texts, }

formatted_dataset = dataset.map(formatting_prompts_func, batched = True,)

# 4. Train the Model
trainer = SFTTrainer(
    model = model,
    tokenizer = tokenizer,
    train_dataset = formatted_dataset,
    dataset_text_field = "text",
    max_seq_length = max_seq_length,
    args = TrainingArguments(
        per_device_train_batch_size = 2,
        gradient_accumulation_steps = 4,
        warmup_steps = 5,
        max_steps = 60, # Increase for real training
        learning_rate = 2e-4,
        fp16 = not torch.cuda.is_bf16_supported(),
        bf16 = torch.cuda.is_bf16_supported(),
        logging_steps = 1,
        optim = "adamw_8bit",
        weight_decay = 0.01,
        lr_scheduler_type = "linear",
        seed = 3407,
        output_dir = "outputs",
    ),
)

if __name__ == "__main__":
    print("Starting Llama 3.1 fine-tuning for AI-Compliance Engine...")
    # trainer.train() 
    # model.save_pretrained("compliance-llama-3.1-8b-lora")
    print("Training script initialized! Run this on a GPU instance.")
