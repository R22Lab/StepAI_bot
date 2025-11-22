import dynamic from 'next/dynamic';

// Dynamically import the RegistrationForm to avoid SSR issues
const RegistrationForm = dynamic(() => import('../components/RegistrationForm'), {
  ssr: false
});

export default function HomePage() {
  return (
    <div>
      <RegistrationForm />
    </div>
  );
}