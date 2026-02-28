import { cn } from '@/lib/utils';

export function Avatar({ initials = 'JD' }: { initials?: string })  {
  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-lg font-semibold text-yellow-400 ring-2 ring-yellow-400/50">
    {initials}
  </div>
};

export function ProfilePage() {
  
  const userData = {
    firstName: 'Ivan',
    lastName: 'Petrov',
    birthDate: '15.05.2000',
    login: 'ivan.ivanov',
    email: 'ivan@example.com'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="rounded-2xl bg-gray-800/80 p-8 shadow-xl backdrop-blur-sm">
          <h1 className="mb-8 text-4xl font-bold text-yellow-400">
            {userData.firstName} {userData.lastName}
          </h1>

          <div className="space-y-6">
            <div className="flex flex-col gap-2 rounded-lg bg-gray-700/50 p-4 md:flex-row md:items-center md:justify-between">
              <span className="text-sm uppercase tracking-wider text-gray-400">
              Date of birth
              </span>
              <span className="text-lg text-yellow-400">
                {userData.birthDate}
              </span>
            </div>

            <div className="flex flex-col gap-2 rounded-lg bg-gray-700/50 p-4 md:flex-row md:items-center md:justify-between">
              <span className="text-sm uppercase tracking-wider text-gray-400">
                Login
              </span>
              <span className="text-lg text-yellow-400">
                {userData.login}
              </span>
            </div>

            <div className="flex flex-col gap-2 rounded-lg bg-gray-700/50 p-4 md:flex-row md:items-center md:justify-between">
              <span className="text-sm uppercase tracking-wider text-gray-400">
                Email
              </span>
              <span className="text-lg text-yellow-400">
                {userData.email}
              </span>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              className={cn(
                "rounded-lg px-6 py-3 font-medium transition-all duration-200",
                "bg-yellow-400 text-gray-900",
                "hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-400/20",
                "active:scale-95 cursor-pointer",
              )}
            >
              Change data
            </button>
          </div>

          
        </div>
      </div>

    </div>
  );
}