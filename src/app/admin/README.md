# vMarket Admin Dashboard

The vMarket Admin Dashboard provides a comprehensive management interface for the vMarket prediction market platform.

## Environment Variables

For local development, create a `.env.local` file in the root directory with the following variables:

```
# Contract configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x949865114535dA93823bf5515608406325b40Fc5
NEXT_PUBLIC_RPC_URL=https://andromeda.metis.io/?owner=1088

# API configuration
NEXT_PUBLIC_API_BASE_URL=/api
```

These environment variables are already set up in your Vercel project settings, so you don't need to modify them for production deployments.

## Contract Configuration

The admin dashboard interacts with the Metis L2 blockchain using the contract at address: `0x949865114535dA93823bf5515608406325b40Fc5`

## Deployment

### Partial Deployment to Vercel (Admin Dashboard Only)

If you want to deploy only the admin dashboard changes without affecting other parts of the application, you can use Git to create and push a branch with only the admin changes:

1. Create a new branch for admin features:
   ```
   git checkout -b admin-dashboard
   ```

2. Add only the admin-related files:
   ```
   git add src/app/admin/*
   git add src/app/components/AdminDashboard.tsx
   git add src/app/api/admin/*
   git add src/app/vesta/utils/contract.ts
   ```

3. Commit your changes:
   ```
   git commit -m "Add admin dashboard"
   ```

4. Push the branch to GitHub:
   ```
   git push origin admin-dashboard
   ```

5. In Vercel, you can then deploy this specific branch instead of your main branch.

## Features and Usage

### Market Management

- **View Markets**: See all existing prediction markets with their details.
- **Create Markets**: Manually create new prediction markets.
- **Resolve Markets**: Select winning outcomes for ended markets.

### Role Management

- **Add/Remove Admins**: Manage administrator access.
- **Add/Remove Resolvers**: Manage resolver privileges.

### Games Management

- **Fetch Sports Games**: Access games data for various leagues by date.
- **Batch Create Markets**: Automatically create markets from games data.

## Troubleshooting

If you encounter issues accessing the admin dashboard:

1. **Access Denied Error**: Make sure your connected wallet address has admin privileges. You can check this by:
   - Verifying the contract address is correct (`0x949865114535dA93823bf5515608406325b40Fc5`)
   - Confirming your wallet has been granted the DEFAULT_ADMIN_ROLE in the contract

2. **Contract Interaction Errors**: Check the browser console for detailed error logs.

3. **API Errors**: Ensure the API routes are functioning correctly by checking network responses in your browser's developer tools. 