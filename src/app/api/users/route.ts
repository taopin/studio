import { NextResponse } from 'next/server';
import { readUsers } from '@/lib/users';

export async function GET() {
  try {
    const users = await readUsers();
    // Ensure passwords are not sent to the client
    const safeUsers = users.map(({ password, ...user }) => user);
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("获取用户时出错:", error);
    return NextResponse.json({ message: "服务器内部错误" }, { status: 500 });
  }
}
