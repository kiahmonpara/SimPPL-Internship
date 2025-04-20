import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get the project root directory
    const projectRoot = process.cwd();
    
    // Build the path to the JSON file
    const filePath = path.join(projectRoot, 'python', 'analysis_output', 'all_visualization_data.json');
    
    // Add debug logging to help troubleshoot
    console.log('Project root:', projectRoot);
    console.log('Attempting to load file from:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    // Read the file
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse JSON and return the data
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    // Log detailed error information
    console.error('Error loading analysis data:', error);
    return NextResponse.json(
      { error: `Failed to load analysis data: ${error.message}` }, 
      { status: 500 }
    );
  }
}