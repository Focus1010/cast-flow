import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';

// Create Wagmi configuration for Base network
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});
