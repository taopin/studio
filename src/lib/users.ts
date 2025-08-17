export type User = {
    username: string;
    password?: string; // Password should not be sent to client
    role: 'admin' | 'user';
    permissions: {
      devices: string[] | 'all';
    };
  };
  
  // This would typically be a database.
  // For this demo, we use a JSON file.
  import usersData from '@/data/users.json';
  import { promises as fs } from 'fs';
  import path from 'path';
  
  const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');
  
  export async function readUsers(): Promise<User[]> {
    try {
      await fs.access(usersFilePath);
      const fileContents = await fs.readFile(usersFilePath, 'utf8');
      return JSON.parse(fileContents);
    } catch (error) {
      // If the file doesn't exist, initialize it with mock data
      await writeUsers(usersData as User[]);
      return usersData as User[];
    }
  }
  
  export async function writeUsers(users: User[]): Promise<void> {
    try {
      const usersToStore = users.map(({ password, ...user }) => user);
      await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
      await fs.writeFile(usersFilePath, JSON.stringify(usersToStore, null, 2), 'utf8');
    } catch (error) {
      console.error("Error writing users file:", error);
    }
  }
  
  export async function findUserByUsername(username: string): Promise<User | undefined> {
    const users = await readUsersWithPasswords(); // Use a special function for server-side auth
    return users.find(user => user.username === username);
  }
  
  // This function should ONLY be used on the server side for authentication.
  // It reads the raw data including passwords.
  export async function readUsersWithPasswords(): Promise<User[]> {
     try {
      await fs.access(usersFilePath);
      const fileContents = await fs.readFile(usersFilePath, 'utf8');
      return JSON.parse(fileContents);
    } catch (error) {
      // Initialize with default data if file doesn't exist.
      // Make sure default data in users.json includes passwords.
      const initialUsers = usersData as User[];
      await fs.mkdir(path.dirname(usersFilePath), { recursive: true });
      await fs.writeFile(usersFilePath, JSON.stringify(initialUsers, null, 2), 'utf8');
      return initialUsers;
    }
  }
  
  export async function updateUserPermissions(username: string, permissions: User['permissions']): Promise<boolean> {
    const users = await readUsersWithPasswords();
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
      return false;
    }
    users[userIndex].permissions = permissions;
    // When writing, passwords need to be included again.
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    return true;
  }
  
  export async function addUser(newUser: User): Promise<User> {
    const users = await readUsersWithPasswords();
    if (users.some(u => u.username === newUser.username)) {
      throw new Error('User already exists');
    }
    users.push(newUser);
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    const { password, ...userToReturn } = newUser;
    return userToReturn;
  }
  