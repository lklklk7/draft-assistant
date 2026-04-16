const ROLES = ['TOP', 'JUNGLE', 'MID', 'BOT', 'SUPPORT'] as const;
export type Role = (typeof ROLES)[number];

interface Props {
  selected: Role | null;
  onChange: (role: Role) => void;
}

export function RoleSelector({ selected, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {ROLES.map((role) => (
        <button
          key={role}
          onClick={() => onChange(role)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === role
              ? 'bg-yellow-400 text-gray-900'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {role}
        </button>
      ))}
    </div>
  );
}
