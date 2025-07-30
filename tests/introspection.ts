import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Introspection } from "../target/types/introspection";
import { Keypair, SystemProgram, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { assert } from "chai";

describe("Introspection Demo", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = anchor.workspace.Introspection as Program<Introspection>;

  it("Verifies a valid transfer", async () => {
    const recipient = Keypair.generate().publicKey;
    const amount = new anchor.BN(LAMPORTS_PER_SOL);
    const transferIx = SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: recipient,
      lamports: amount.toNumber(),
    });
    await program.methods
      .verifyTransferInstruction(recipient, amount, 0)
      .accounts({
        instructionsSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .preInstructions([transferIx])
      .rpc();
    assert.ok(true);
  });

  it("Fails with wrong amount", async () => {
    const recipient = Keypair.generate().publicKey;
    const amount = new anchor.BN(LAMPORTS_PER_SOL);
    const wrongAmount = new anchor.BN(2 * LAMPORTS_PER_SOL);
    const transferIx = SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: recipient,
      lamports: wrongAmount.toNumber(),
    });
    try {
      await program.methods
        .verifyTransferInstruction(recipient, amount, 0)
        .accounts({
          instructionsSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        })
        .preInstructions([transferIx])
        .rpc();
      assert.fail("Expected InvalidAmount error");
    } catch (err) {
      assert.include(err.message, "Wrong transfer amount");
    }
  });

  it("Fails with invalid instruction index", async () => {
    const recipient = Keypair.generate().publicKey;
    const amount = new anchor.BN(LAMPORTS_PER_SOL);
    try {
      await program.methods
        .verifyTransferInstruction(recipient, amount, 2)
        .accounts({
          instructionsSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        })
        .rpc();
      assert.fail("Expected InvalidInstructionIndex error");
    } catch (err) {
      assert.include(err.message, "Invalid instruction index");
    }
  });
});