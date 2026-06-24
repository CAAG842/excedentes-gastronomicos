export default function ConfirmModal({ mensaje, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
        <p className="text-gray-800 font-medium mb-6">{mensaje}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
            Confirmar
          </button>
          <button onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
