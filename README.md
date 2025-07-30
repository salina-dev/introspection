# Solana Instruction Introspection with Anchor

This repository contains an Anchor program and tests demonstrating **instruction introspection** in Solana. The program verifies a `SystemProgram.transfer` instruction within a transaction using the `Instructions` sysvar, without performing a cross-program invocation (CPI). It's based on a [tutorial](https://www.notion.so/Instruction-Introspection-in-Solana-Anchor-Programs-21263b5fa3c880148d10c2079a83ade0) that explains how to inspect transaction instruction metadata in a Solana program built with Anchor.

## Overview

Instruction introspection allows a Solana program to inspect metadata of all instructions in a transaction (e.g., program ID, accounts, data) via the `Instructions` sysvar (`Sysvar1nstructions1111111111111111111111111`). This program checks that a transaction includes a `SystemProgram.transfer` instruction with a specific recipient and amount (e.g., 1 SOL) at a specified index.

### Key Features
- **Program**: Verifies a `SystemProgram.transfer` instruction at a specified index, checking:
  - Program ID (`SystemProgram`).
  - Discriminator (`[2, 0, 0, 0]`, hardcoded as it's derived from the `SystemInstruction::Transfer` variant).
  - Recipient (second account, index 1; index 0 is the source/payer).
  - Amount (1 SOL, extracted as a `u64` from instruction data, 8 bytes/64 bits).
  - **Security**: Enforces 2-instruction limit to prevent multiplication attacks.
- **Tests**: Includes three Anchor tests:
  - Verifies a valid transfer (1 SOL to the recipient).
  - Fails when the transfer amount is incorrect (2 SOL).
  - Fails when trying to access an invalid instruction index (violates 2-instruction limit).
- **Security**: Uses Anchor constraints to ensure the `Instructions` sysvar is valid, plus bounds checking and 2-instruction limit enforcement.
- **Performance**: Introspection adds ~1,000 compute units per instruction check.

## Prerequisites

- **Rust**: Install Rust and Cargo (`rustup` recommended).
- **Solana CLI**: Install version 1.17.30 (`solana-install init 1.17.30`).
- **Anchor**: Install Anchor CLI 0.29.0 using `avm` or `cargo install` (see Setup).
- **Node.js**: For running tests (`npm` or `yarn` required).
- **Solana Test Validator**: For local testing (included with Solana CLI 1.17.30).
- **Solana Wallet**: Ensure a keypair exists at `~/.config/solana/id.json` (run `solana-keygen new` if needed).

## Build the Program

`anchor build`

This compiles the Rust program (using anchor-lang = 0.29.0, solana-program = 1.17.30) and generates the IDL in target/types/introspection.ts.

## Update Program ID

The program uses a placeholder ID (8jEAoFwK5eZ7oE2WKD8AnYNA8Z82BXmKfLH8sMub4Yiv). After building, Anchor generates a new keypair. Update lib.rs and Anchor.toml with the generated ID:

Replace declare_id!("8jEAoFwK5eZ7oE2WKD8AnYNA8Z82BXmKfLH8sMub4Yiv"); in lib.rs and the [programs.localnet] section in Anchor.toml.


## Run Tests

`anchor test`

This runs the tests in tests/introspection.ts, which:
- **Test 1**: Verifies a SystemProgram.transfer of 1 SOL to a recipient at index 0.
- **Test 2**: Fails when the transfer amount is 2 SOL, expecting an InvalidAmount error.
- **Test 3**: Fails when trying to access instruction index 2, expecting an InvalidInstructionIndex error (enforces 2-instruction limit).

**Note**: Tests use Anchor's `.preInstructions` method to add the transfer instruction before the program's instruction, ensuring it's at index 0. The system_program account is not included, as the program uses the SystemProgram ID constant (`solana_program::system_program::ID`) for verification, not a CPI.


