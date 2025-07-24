use anchor_lang::prelude::*;
use solana_program::{program_error::ProgramError, sysvar::instructions};

declare_id!("8jEAoFwK5eZ7oE2WKD8AnYNA8Z82BXmKfLH8sMub4Yiv");

#[program]
pub mod introspection {
    use super::*;

    pub fn verify_transfer_instruction(
        ctx: Context<CheckInstruction>,
        recipient: Pubkey,
        amount: u64,
    ) -> Result<()> {
        // Load the first instruction (index 0)
        let instruction = instructions::load_instruction_at_checked(0, &ctx.accounts.instructions_sysvar)?;

        // Check the program ID is SystemProgram
        require_keys_eq!(
            instruction.program_id,
            solana_program::system_program::ID,
            CustomError::InvalidInstructionType
        );

        // Check data length (4 bytes discriminator + 8 bytes amount)
        if instruction.data.len() < 12 {
            return Err(ProgramError::InvalidInstructionData.into());
        }

        // Check the transfer discriminator
        if instruction.data[0..4] != [2, 0, 0, 0] {
            return Err(CustomError::InvalidInstructionType.into());
        }

        // Check the recipient (second account in SystemProgram.transfer)
        require!(
            !(instruction.accounts.is_empty() || instruction.accounts[1].pubkey != recipient),
            CustomError::InvalidRecipient
        );

        // Check the amount
        let instruction_amount = u64::from_le_bytes(instruction.data[4..12].try_into().unwrap());
        require_eq!(instruction_amount, amount, CustomError::InvalidAmount);

        // Log success
        msg!("Verified transfer of {} lamports to {}", amount, recipient);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CheckInstruction<'info> {
    /// CHECK: Must be the Instructions sysvar
    #[account(address = solana_program::sysvar::instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

#[error_code]
pub enum CustomError {
    #[msg("Not a SystemProgram transfer")]
    InvalidInstructionType,
    #[msg("Wrong recipient public key")]
    InvalidRecipient,
    #[msg("Wrong transfer amount")]
    InvalidAmount,
}
