import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get('imagePath');
  
  if (!imagePath) {
    return NextResponse.json({ error: 'Invalid image path' }, { status: 400 });
  }
  
  // Security check: ensure the path is within allowed directories
  if (!imagePath.startsWith('python/input/') && !imagePath.includes('..')) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }
  
  // Construct the file path
  const filePath = path.join(process.cwd(), imagePath);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`Image not found: ${filePath}`);
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // Get the file's content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    };
    
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    // Read the file
    const imageBuffer = fs.readFileSync(filePath);
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'  // Cache for 1 day
      }
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}