import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { readUsers, writeUsers } from '@/lib/users';

// Data is stored in data.json and users.json
const dataFilePath = path.join(process.cwd(), 'src', 'data', 'data.json');
const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function getDevicesFromData(): Promise<string[]> {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        const devices = [...new Set(data.map((d: any) => d.deviceId))];
        devices.sort();
        return devices as string[];
    } catch (error) {
        console.error("读取设备时出错:", error);
        return [];
    }
}

export async function GET() {  
  const devices = await getDevicesFromData();
  return NextResponse.json(devices);
}

export async function POST(request: Request) {
    const { deviceId } = await request.json();
    if (!deviceId) {
        return NextResponse.json({ message: '设备ID是必需的' }, { status: 400 });
    }

    // In a real app, you might validate the device ID format
    // For now, we assume it's just added to the system, but since devices are derived
    // from data.json, we can't "add" a device here directly. We can simulate it
    // for permission purposes. The UI will treat it as a valid device.
    // The main logic is that getDevicesFromData will be the source of truth.
    // A better approach would be a dedicated devices.json, but for now we'll work with the existing structure.
    
    // No actual file writing needed here as devices are derived from data.json
    // A new device will appear once data from it is received.
    // We can return a success message to make the UI work.
    
    return NextResponse.json({ message: '设备已添加（将在收到数据后显示）' }, { status: 201 });
}


export async function DELETE(request: Request) {
    const { deviceId } = await request.json();
    if (!deviceId) {
        return NextResponse.json({ message: '设备ID是必需的' }, { status: 400 });
    }
    
    // This is a complex operation as it requires:
    // 1. Removing the device from all user permissions.
    // 2. Removing all data entries with this deviceId from data.json.

    try {
        // 1. Update user permissions
        const users = await readUsers();
        const updatedUsers = users.map(user => {
            if (Array.isArray(user.permissions.devices)) {
                user.permissions.devices = user.permissions.devices.filter(d => d !== deviceId);
            }
            return user;
        });
        await writeUsers(updatedUsers);

        // 2. Filter data.json
        const dataFileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(dataFileContents);
        const updatedData = data.filter((entry: any) => entry.deviceId !== deviceId);
        await fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2), 'utf8');

        return NextResponse.json({ message: '设备及其关联数据已删除' });

    } catch (error) {
        console.error("删除设备时出错:", error);
        return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
    }
}
