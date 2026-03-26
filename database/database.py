from supabase import create_client

SUPABASE_URL = "https://kblvhzqxscmzcnqboxrs.supabase.co"
SUPABASE_KEY = "sb_publishable_cgcE4kOdf1lpfpQpcBulKQ_7-839T0N"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)