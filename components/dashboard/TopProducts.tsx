interface Product {
  name: string;
  quantity: number;
  sellPrice: number;
  total: number;
}

interface Props {
  products: Product[];
}

function fmt(n: number) {
  return new Intl.NumberFormat('uz-UZ').format(n);
}

export default function TopProducts({ products }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Top 10 mahsulot (bu hafta)
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-400 dark:text-gray-500 w-10">
                №
              </th>
              <th className="text-left py-2 px-3 text-xs font-medium text-gray-400 dark:text-gray-500">
                Mahsulot nomi
              </th>
              <th className="text-right py-2 px-3 text-xs font-medium text-gray-400 dark:text-gray-500">
                Soni
              </th>
              <th className="text-right py-2 px-3 text-xs font-medium text-gray-400 dark:text-gray-500">
                Sotuv narxi
              </th>
              <th className="text-right py-2 px-3 text-xs font-medium text-gray-400 dark:text-gray-500">
                Jami
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-gray-400 dark:text-gray-600 text-sm"
                >
                  Bu hafta sotuv ma'lumoti yo'q
                </td>
              </tr>
            ) : (
              products.map((p, i) => (
                <tr
                  key={p.name}
                  className="border-b border-gray-100 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 text-gray-400 dark:text-gray-500">
                    {i + 1}
                  </td>
                  <td className="py-2.5 px-3 text-gray-900 dark:text-white font-medium">
                    {p.name}
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-600 dark:text-gray-400">
                    {p.quantity}
                  </td>
                  <td className="py-2.5 px-3 text-right text-gray-600 dark:text-gray-400">
                    {fmt(p.sellPrice)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-blue-600 dark:text-blue-400 font-semibold">
                    {fmt(p.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
