import { NextResponse } from 'next/server';
import { updateUserPermissions, findUserByUsername, User } from '@/lib/users';

export async function PUT(request: Request) {
  try {
    const { username, permissions } = await request.json();

    if (!username || !permissions) {
      return NextResponse.json({ message: '缺少用户名或权限' }, { status: 400 });
    }
    
    const user = await findUserByUsername(username);
    if (!user) {
        return NextResponse.json({ message: '未找到用户' }, { status: 404 });
    }

    if (user.role === 'admin') {
        return NextResponse.json({ message: '不能修改管理员权限' }, { status: 403 });
    }

    const success = await updateUserPermissions(username, permissions as User['permissions']);

    if (success) {
      return NextResponse.json({ message: '权限更新成功' });
    } else {
      return NextResponse.json({ message: '更新权限失败' }, { status: 500 });
    }
  } catch (error) {
    console.error('更新权限时出错:', error);
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
}
