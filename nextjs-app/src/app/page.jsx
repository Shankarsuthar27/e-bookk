import { redirect } from 'next/navigation';

export default function RootAuthPage() {
  redirect('/login');
}
