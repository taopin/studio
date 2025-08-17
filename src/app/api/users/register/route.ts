import { NextResponse } from 'next/server';
import { addUser, findUserByUsername, User } from '@/lib/users';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: '用户名和密码是必需的' }, { status: 400 });
    }

    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return NextResponse.json({ message: '用户名已存在' }, { status: 409 });
    }

    const newUser: User = {
      username,
      password,
      role: 'user',
      permissions: {
        devices: [], // Start with no device permissions
      },
    };

    const addedUser = await addUser(newUser);

    return NextResponse.json(addedUser, { status: 201 });

  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
}
