import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { mockData, DataEntry } from '@/lib/data';

// The path to the data file
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'data.json');

// Helper function to read data from the file
async function readData(): Promise<DataEntry[]> {
  try {
    await fs.access(dataFilePath);
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    // If the file doesn't exist, initialize it with mock data
    await writeData(mockData);
    return mockData;
  }
}

// Helper function to write data to the file
async function writeData(data: DataEntry[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing data file:", error);
  }
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const newDataEntry: DataEntry = await request.json();
    
    // Basic validation
    if (!newDataEntry.timestamp || !newDataEntry.deviceId || !newDataEntry.animalId) {
        return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    const data = await readData();
    data.unshift(newDataEntry); // Add new entry to the beginning
    await writeData(data);

    return NextResponse.json({ message: 'Data added successfully', entry: newDataEntry }, { status: 201 });
  } catch (error) {
    console.error('Error processing POST request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
