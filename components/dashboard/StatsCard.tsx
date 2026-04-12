interface StatsCardProps {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'red';
  icon: React.ReactNode;
}

function formatSum(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
}

export default function StatsCard({ title, value, color, icon }: StatsCardProps) {
  const iconBg = {
    blue: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400',
    green: 'bg-green-50 text-green-500 dark:bg-green-500/10 dark:text-green-400',
    red: 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400',
  };

  const valueColor = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-500 dark:text-red-400',
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg[color]}`}>
          {icon}
        </div>
      </div>
      <p className={`text-xl font-bold ${valueColor[color]}`}>
        {formatSum(value)}
      </p>
    </div>
  );
}
