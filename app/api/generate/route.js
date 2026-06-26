import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const IMAGE_COST = 10;

const allowedAspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '21:9'];

const allowedStyles = [
  'none',
  'cinematic',
  'anime',
  '3d-render',
  'cyberpunk',
  'pixel-art',
  'oil-painting',
  'photorealistic',
  'digital-art',
  'fantasy-art',
];

function buildFinalPrompt(prompt, style) {
  const styleMap = {
    none: '',
    cinematic: 'cinematic movie lighting, dramatic composition, high detail',
    anime: 'anime style, manga-inspired, clean line art, vibrant colors',
    '3d-render': '3D render, Pixar-like quality, Blender render, soft lighting',
    cyberpunk: 'cyberpunk style, neon lights, futuristic city atmosphere',
    'pixel-art': 'retro pixel art style, 16-bit game aesthetic',
    'oil-painting': 'classic oil painting style, visible brush strokes, artistic texture',
    photorealistic: 'photorealistic, realistic lighting, high detail, natural colors',
    'digital-art': 'digital art, highly detailed, concept art style',
    'fantasy-art': 'fantasy art, magical atmosphere, epic composition',
  };

  if (!style || style === 'none') {
    return prompt;
  }

  return `${prompt}, ${styleMap[style] || style}`;
}

export async function POST(req) {
  try {
    console.log('STEP 1: API /generate started');

    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized access. Please log in.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    console.log('STEP 2: User verified:', userId);

    const body = await req.json().catch(() => ({}));

    const { prompt, aspectRatio, style } = body;

    const cleanPrompt = typeof prompt === 'string' ? prompt.trim() : '';
    const selectedAspectRatio = aspectRatio || '1:1';
    const selectedStyle = style || 'none';

    if (!cleanPrompt) {
      return NextResponse.json(
        { error: 'Prompt is required.' },
        { status: 400 }
      );
    }

    if (cleanPrompt.length < 3) {
      return NextResponse.json(
        { error: 'Prompt is too short.' },
        { status: 400 }
      );
    }

    if (cleanPrompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt is too long. Maximum is 1000 characters.' },
        { status: 400 }
      );
    }

    if (!allowedAspectRatios.includes(selectedAspectRatio)) {
      return NextResponse.json(
        { error: 'Invalid aspect ratio.' },
        { status: 400 }
      );
    }

    if (!allowedStyles.includes(selectedStyle)) {
      return NextResponse.json(
        { error: 'Invalid style.' },
        { status: 400 }
      );
    }

    console.log('STEP 3: Input validated');

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found.' },
        { status: 404 }
      );
    }

    if (profile.credits < IMAGE_COST) {
      return NextResponse.json(
        { error: `Insufficient credits! You need ${IMAGE_COST} credits.` },
        { status: 403 }
      );
    }

    console.log('STEP 4: Credits checked');

    const replicateToken = process.env.REPLICATE_API_TOKEN;

    if (!replicateToken) {
      return NextResponse.json(
        { error: 'Missing REPLICATE_API_TOKEN in environment variables.' },
        { status: 500 }
      );
    }

    const finalPrompt = buildFinalPrompt(cleanPrompt, selectedStyle);

    console.log('STEP 5: Sending request to Replicate');

    const replicateResponse = await fetch(
      'https://api.replicate.com/v1/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Token ${replicateToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'black-forest-labs/flux-schnell',
          input: {
            prompt: finalPrompt,
            aspect_ratio: selectedAspectRatio,
          },
        }),
      }
    );

    let prediction = await replicateResponse.json().catch(() => ({}));

    if (!replicateResponse.ok) {
      return NextResponse.json(
        { error: prediction.detail || 'Replicate failed.' },
        { status: 500 }
      );
    }

    const predictionId = prediction.id;

    if (!predictionId) {
      return NextResponse.json(
        { error: 'Replicate did not return a prediction ID.' },
        { status: 500 }
      );
    }

    console.log('STEP 6: Polling started:', predictionId);

    let attempts = 0;
    const maxAttempts = 15;

    while (
      prediction.status !== 'succeeded' &&
      prediction.status !== 'failed' &&
      attempts < maxAttempts
    ) {
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const checkResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${replicateToken}`,
          },
        }
      );

      prediction = await checkResponse.json().catch(() => ({}));

      attempts++;
    }

    if (prediction.status === 'failed') {
      return NextResponse.json(
        { error: prediction.error || 'Image generation failed.' },
        { status: 500 }
      );
    }

    if (prediction.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Image generation timed out. Please try again.' },
        { status: 504 }
      );
    }

    let generatedImageUrl = null;

    if (prediction.output) {
      generatedImageUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;
    }

    if (!generatedImageUrl) {
      return NextResponse.json(
        { error: 'Image generated but no output URL was returned.' },
        { status: 500 }
      );
    }

    console.log('STEP 7: Image URL received');

    const imageResponse = await fetch(generatedImageUrl);

    if (!imageResponse.ok) {
      throw new Error('Failed to download image from Replicate.');
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    console.log('STEP 8: Image downloaded');

    const fileName = `${userId}/${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Storage Upload Error: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(fileName);

    if (!publicUrl) {
      throw new Error('Failed to get public URL from Supabase Storage.');
    }

    console.log('STEP 9: Image uploaded to Supabase Storage');

    const { data: savedData, error: saveError } = await supabase.rpc(
      'save_generated_image_and_deduct_credits',
      {
        p_user_id: userId,
        p_prompt: cleanPrompt,
        p_image_url: publicUrl,
        p_aspect_ratio: selectedAspectRatio,
        p_style: selectedStyle,
        p_cost: IMAGE_COST,
      }
    );

    if (saveError) {
      return NextResponse.json(
        { error: `Save/Credit Error: ${saveError.message}` },
        { status: 500 }
      );
    }

    const remainingCredits = savedData?.[0]?.remaining_credits;

    console.log('STEP 10: Image saved and credits deducted');

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      remainingCredits,
    });
  } catch (error) {
    console.error('GENERATE API ERROR:', error);

    return NextResponse.json(
      {
        error: error.message || 'Unexpected server error.',
      },
      { status: 500 }
    );
  }
}