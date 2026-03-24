import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('📤 Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
    console.log('🔑 BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '✓ Set' : '❌ NOT SET');

    // Use Vercel Blob for upload
    const blob = await put(file.name, file, {
      access: 'public',
    });

    console.log('✅ Upload successful:', blob.url);
    return NextResponse.json({ url: blob.url }, { status: 201 });
  } catch (error) {
    console.error('❌ Upload error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Upload failed: ${errorMsg}` }, { status: 500 });
  }
}
