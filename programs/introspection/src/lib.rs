use anchor_lang::prelude::*;

declare_id!("8jEAoFwK5eZ7oE2WKD8AnYNA8Z82BXmKfLH8sMub4Yiv");

#[program]
pub mod introspection1 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
