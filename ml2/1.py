from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import Whitespace
from tokenizers.normalizers import Lowercase, NFD, StripAccents, Sequence
import os


# ---------- Step 1: Chat corpus ----------
chat_corpus = [
    "hey how are you",
    "this is so good",
    "what are you doing now",
    "yaaay I love this",
    "this is amazing",
    "feeling happy and relaxed",
    "that’s sooo funny",
    "I am so excited!",
    "heyyy what’s up",
    "cool cool cool!"
]


# ---------- Step 2: Initialize Tokenizer ----------
tokenizer = Tokenizer(BPE(unk_token="[UNK]"))


# Set normalization: lowercase, remove accents
tokenizer.normalizer = Sequence([
    NFD(),
    Lowercase(),
    StripAccents()
])


# Set pre-tokenizer: split by whitespace
tokenizer.pre_tokenizer = Whitespace()


# ---------- Step 3: Train the tokenizer ----------
trainer = BpeTrainer(
    vocab_size=100,  # limit vocab size
    special_tokens=["[UNK]", "[PAD]", "[START]", "[END]"]
)
tokenizer.train_from_iterator(chat_corpus, trainer)


# ---------- Step 4: Save tokenizer ----------
tokenizer_path = "chat_tokenizer"
if not os.path.exists(tokenizer_path):
    os.makedirs(tokenizer_path)
tokenizer.model.save(tokenizer_path)


# ---------- Step 5: Load tokenizer with vocab & merges ----------
vocab_path = os.path.join(tokenizer_path, "vocab.json")
merges_path = os.path.join(tokenizer_path, "merges.txt")
tokenizer = Tokenizer(BPE.from_file(vocab_path, merges_path, unk_token="[UNK]"))


# ---------- Step 6: Define test cases ----------
test_cases = [
    "heyyy I’m so happy!",
    "yaaay this is cool",
    "that’s sooo nice",
    "what’s up??",
    ""
]


# ---------- Step 7: Tokenize and display results ----------
print("---- BPE Tokenizer Output ----")
for i, text in enumerate(test_cases):
    encoded = tokenizer.encode(text)
    print("Input Sentence:",text)
    print("Tokens:", encoded.tokens)
    print("Token IDs:", encoded.ids)