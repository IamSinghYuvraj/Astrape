import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-900 md:text-8xl">404</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800 md:text-3xl">
        Page Not Found
      </h2>
      <p className="mt-3 max-w-md text-gray-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/" className="inline-flex items-center gap-2">
          <Home className="h-4 w-4" />
          Go back home
        </Link>
      </Button>
    </div>
  );
}
