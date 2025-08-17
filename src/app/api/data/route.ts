import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { mockData, DataEntry } from '@/lib/data';
import { randomUUID } from 'crypto';

// The path to the data file
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'data.json');

// Helper function to read data from the file
async function readData(): Promise<DataEntry[]> {
  try {
    await fs.access(dataFilePath);
    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    // Add IDs to old data if they don't exist
    return data.map((d: any) => ({ ...d, id: d.id || randomUUID() }));
  } catch (error) {
    // If the file doesn't exist, initialize it with mock data
    const initialData = mockData.map(d => ({ ...d, id: randomUUID() }));
    await writeData(initialData);
    return initialData;
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
    const newDataEntry: Omit<DataEntry, 'id'> = await request.json();
    
    // Basic validation
    if (!newDataEntry.timestamp || !newDataEntry.deviceId || !newDataEntry.animalId) {
        return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    const data = await readData();
    const entryWithId = { ...newDataEntry, id: randomUUID() };
    data.unshift(entryWithId); // Add new entry to the beginning
    await writeData(data);

    return NextResponse.json({ message: 'Data added successfully', entry: entryWithId }, { status: 201 });
  } catch (error) {
    console.error('Error processing POST request:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: '需要提供要删除的ID数组' }, { status: 400 });
    }

    const data = await readData();
    const updatedData = data.filter(entry => !ids.includes(entry.id));

    if (data.length === updatedData.length) {
      // This case could happen if IDs are invalid, but we'll proceed silently
    }
    
    await writeData(updatedData);

    return NextResponse.json({ message: '数据删除成功' });
  } catch (error) {
    console.error('处理DELETE请求时出错:', error);
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
}
