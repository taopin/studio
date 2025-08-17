import { NextResponse } from 'next/server';
import { findUserByUsername } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: '用户名和密码是必需的' }, { status: 400 });
    }

    const user = await findUserByUsername(username);

    if (!user || user.password !== password) {
      return NextResponse.json({ message: '用户名或密码无效' }, { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userToReturn } = user;

    return NextResponse.json(userToReturn);

  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
}
