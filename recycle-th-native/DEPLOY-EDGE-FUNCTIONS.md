# Deploying Supabase Edge Functions

## Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Access to your Supabase project

## Step 1: Link Your Supabase Project

```bash
cd recycle-th-native
supabase link --project-ref YOUR_PROJECT_REF
```

You can find your project ref in the Supabase dashboard URL: `https://app.supabase.com/project/YOUR_PROJECT_REF`

## Step 2: Set Environment Variables

In your Supabase dashboard:
1. Go to Settings → Edge Functions
2. Add the following secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key

## Step 3: Deploy the Edge Functions

```bash
# Deploy analyze-image function
supabase functions deploy analyze-image

# Deploy chat function
supabase functions deploy chat
```

## Step 4: Update Your App Configuration

1. Remove `OPENAI_API_KEY` from your `.env` file
2. Ensure your `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set correctly

## Step 5: Test the Functions

```bash
# Test analyze-image function
supabase functions invoke analyze-image --body '{"imageBase64":"..."}'

# Test chat function
supabase functions invoke chat --body '{"message":"Hello","history":[]}'
```

## Troubleshooting

### If functions fail to deploy:
1. Check that you're logged in: `supabase login`
2. Verify project is linked: `supabase status`
3. Check function logs: `supabase functions logs analyze-image`

### If functions return errors:
1. Verify OPENAI_API_KEY is set in Supabase dashboard
2. Check function logs for detailed error messages
3. Ensure your OpenAI API key has sufficient credits

## Security Notes

- **NEVER** commit your OpenAI API key to version control
- The Edge Functions run on Supabase's servers, keeping your API key secure
- Monitor your OpenAI usage to prevent unexpected charges

## Production Checklist

- [ ] OpenAI API key removed from `.env` file
- [ ] Edge Functions deployed successfully
- [ ] Environment variables set in Supabase dashboard
- [ ] Functions tested and working
- [ ] Error handling verified
- [ ] Rate limiting considered (if needed)