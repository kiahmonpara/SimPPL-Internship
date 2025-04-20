import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "python","input", "all_visualization_data.json");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Reddit analysis data not found" },
        { status: 404 }
      );
    }
    
    const fileContent = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(fileContent);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading Reddit analysis data:", error);
    return NextResponse.json(
      { error: "Failed to load Reddit analysis data" },
      { status: 500 }
    );
  }
}