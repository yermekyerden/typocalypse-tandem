type AuthFormValues = {
  email: string;
  password: string;
};

type AuthFormProps = {
  values: AuthFormValues;
  onChange: (field: keyof AuthFormValues, value: string) => void;
};

export function AuthForm({ values, onChange }: AuthFormProps) {
  return (
    <div className="space-y-7">
      <label className="block">
        <span className="sr-only">Email</span>
        <input
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={values.email}
          onChange={(event) => onChange('email', event.target.value)}
          className="h-18 w-full rounded-xl border-4 border-slate-300 bg-slate-50 px-6 text-lg text-slate-700 outline-none transition focus-visible:border-sky-600"
        />
      </label>

      <label className="block">
        <span className="sr-only">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={values.password}
          onChange={(event) => onChange('password', event.target.value)}
          className="h-18 w-full rounded-xl border-4 border-slate-300 bg-slate-50 px-6 text-lg text-slate-700 outline-none transition focus-visible:border-sky-600"
        />
      </label>
    </div>
  );
}
