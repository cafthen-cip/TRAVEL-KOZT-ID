
export default function handler(request: any, response: any) {
  return response.status(200).json({ status: 'deprecated', message: 'Use Supabase client instead' });
}
