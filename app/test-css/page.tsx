export default function TestCSS() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          CSS Test Sahifasi
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Agar siz bu matnni ko'rayotgan bo'lsangiz va ranglar, shriftlar to'g'ri ko'rinsa, 
          CSS to'g'ri ishlayapti.
        </p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-red-500 text-white p-4 rounded text-center">
            Qizil
          </div>
          <div className="bg-green-500 text-white p-4 rounded text-center">
            Yashil
          </div>
          <div className="bg-blue-500 text-white p-4 rounded text-center">
            Ko'k
          </div>
        </div>

        <div className="flex gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
            Tugma 1
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors">
            Tugma 2
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors">
            Tugma 3
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-bold">Diqqat!</p>
          <p>Agar bu xabar sariq rangda ko'rinmasa, CSS yuklanmagan.</p>
        </div>

        <div className="mt-6">
          <a href="/dashboard" className="text-blue-600 hover:underline text-lg">
            ← Dashboard'ga qaytish
          </a>
        </div>
      </div>
    </div>
  );
}
