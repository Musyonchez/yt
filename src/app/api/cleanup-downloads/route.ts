import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    const downloadsDir = path.join(process.cwd(), 'public', 'downloads');
    
    if (!fs.existsSync(downloadsDir)) {
      return NextResponse.json({
        success: true,
        message: 'No downloads directory to clean'
      });
    }

    // Get all MP3 files
    const files = fs.readdirSync(downloadsDir).filter(file => file.endsWith('.mp3'));
    
    let deletedCount = 0;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(downloadsDir, file);
      const stats = fs.statSync(filePath);
      
      // Delete files older than 24 hours
      if (now - stats.mtime.getTime() > maxAge) {
        try {
          fs.unlinkSync(filePath);
          deletedCount++;
          console.log(`Deleted old download: ${file}`);
        } catch (error) {
          console.error(`Failed to delete ${file}:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} old download files`,
      deleted_count: deletedCount,
      remaining_files: files.length - deletedCount
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cleanup downloads' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Download cleanup API is running',
    endpoints: {
      POST: '/api/cleanup-downloads - Clean up files older than 24 hours',
    },
    note: 'Automatically removes MP3 files older than 24 hours to save disk space'
  });
}