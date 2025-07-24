import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Introspection } from "../target/types/introspection";
import { Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("Introspection Demo", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider() as anchor.AnchorProvider;
  const program = anchor.workspace.Introspection as Program<Introspection>;

  it("Verifies a valid transfer", async () => {
    const recipient = Keypair.generate().publicKey;
    const amount = new anchor.BN(LAMPORTS_PER_SOL); // 1 SOL

    console.log("Amount:", amount.toString());
    console.log("Recipient:", recipient.toBase58());

    const transferIx = SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: recipient,
      lamports: amount.toNumber(),
    });

    await program.methods
      .verifyTransferInstruction(recipient, amount)
      .accounts({
        instructionsSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .preInstructions([transferIx])
      .rpc();

    assert.ok(true);
  });

  it("Fails with wrong amount", async () => {
    const recipient = Keypair.generate().publicKey;
    const amount = new anchor.BN(LAMPORTS_PER_SOL); // 1 SOL
    const wrongAmount = new anchor.BN(2 * LAMPORTS_PER_SOL); // 2 SOL

    console.log("Amount:", amount.toString());
    console.log("Wrong Amount:", wrongAmount.toString());
    console.log("Recipient:", recipient.toBase58());

    const transferIx = SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: recipient,
      lamports: wrongAmount.toNumber(),
    });

    try {
      await program.methods
        .verifyTransferInstruction(recipient, amount)
        .accounts({
          instructionsSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        })
        .preInstructions([transferIx])
        .rpc();
      assert.fail("Expected InvalidAmount error");
    } catch (err) {
      // Match the exact error message from CustomError::InvalidAmount
      assert.include(err.message, "Wrong transfer amount");
    }
  });
});