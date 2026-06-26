import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: 'Missing NEXT_PUBLIC_SUPABASE_URL.' },
        { status: 500 }
      );
    }

    const parsedImageUrl = new URL(imageUrl);
    const allowedHost = new URL(supabaseUrl).hostname;

    if (parsedImageUrl.hostname !== allowedHost) {
      return NextResponse.json(
        { error: 'Invalid image URL.' },
        { status: 400 }
      );
    }

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image.' },
        { status: 500 }
      );
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="fluxcraft-image-${Date.now()}.png"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Download failed.' },
      { status: 500 }
    );
  }
}