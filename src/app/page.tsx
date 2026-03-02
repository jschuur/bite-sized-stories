import Link from 'next/link';

export default function Home() {
  return (
    <div className='py-12 px-4'>
      <div className='mx-auto max-w-4xl text-center space-y-6'>
        <h1 className='text-3xl font-bold tracking-tight'>
          Random short stories for language practice
        </h1>
        <div className='flex justify-center gap-4'>
          <Link
            href='/stories'
            className='inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors'
          >
            Browse Stories
          </Link>
          <Link
            href='/new'
            className='inline-flex items-center px-6 py-3 rounded-lg border border-input bg-background font-medium hover:bg-accent hover:text-accent-foreground transition-colors'
          >
            Generate a Story
          </Link>
        </div>
      </div>
    </div>
  );
}
