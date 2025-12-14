
export default function SettingsPage() {
    return (
        <div>
            <h2 className="text-2xl font-bold leading-7 text-gray-900 mb-8">Paramètres</h2>
            <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">Paramètres de l'application</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>Gérez votre compte et vos préférences ici.</p>
                    </div>
                    <div className="mt-5">
                        <button type="button" className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                            Enregistrer les modifications
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
