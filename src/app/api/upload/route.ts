import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Prefer Vercel Blob if token is configured
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      try {
        const blob = await put(file.name, file, {
          access: 'public',
          addRandomSuffix: true,
          token,
        });
        return NextResponse.json({ url: blob.url }, { status: 201 });
      } catch (err) {
        console.error('Vercel Blob upload error:', err);
        // fallthrough to local storage
      }
    }

    // Fallback: save to local public/uploads directory
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    const suffix = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
    const safeName = file.name.replace(/[^a-z0-9.\-_]/gi, '_');
    const filename = `${suffix}-${safeName}`;
    const dest = path.join(uploadsDir, filename);
    await fs.promises.writeFile(dest, buffer);
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
  }
}
