import { useState } from "react";
import { BackupValidationButtonProps } from "../../types/props/backup/BackupValidationButtonProps";
import { useAuth } from "../../hooks/useAuthHook";


export default function BackupValidationButton({ backupApi, onSuccess }: BackupValidationButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();

    const handleRunBackup = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await backupApi.runValidation(token!);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Manual backup failed: ", err);
            setError("Manual backup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-end mb-3">
            <button
                onClick={handleRunBackup}
                disabled={isLoading}
                className={`m-2! px-4 py-2 rounded-[10px]! text-white font-semibold ${isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-[#007a55] hover:bg-[#059669]"}`}>
                {isLoading ? "Running..." : "Run Backup"}
            </button>

            {error && (
                <span className="ml-3 text-red-400 text-sm">{error}</span>
            )}
        </div>
    )
}