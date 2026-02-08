import { useEffect, useState } from 'react';
import { IUebaAPI } from '../../api/ueba/IUebaAPI';
import { AnomalyResultDTO } from '../../types/ueba/AnomalyResultDTO';
import { MdOutlineAnalytics } from 'react-icons/md';
import AnomaliesTable from '../tables/ueba/AnomaliesTable';
import AnomaliesGraph from '../ueba/AnomaliesGraph';
import AnomaliesFilterSelect from '../ueba/AnomaliesFilterSelect';

interface UebaProps {
  uebaApi: IUebaAPI;
}

export default function Ueba({ uebaApi }: UebaProps) {
  const [anomalies, setAnomalies] = useState<AnomalyResultDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState<string>("*");
  const [roles, setRoles] = useState<string[]>([]);
  const [userIds, setUserIds] = useState<number[]>([]);

  const token = 'token'; // TODO: DELETE AFTER TESTING

  const getFilterOptions = (): { label: string; value: string; type: "role" | "user" }[] => {
    const options: { label: string; value: string; type: "role" | "user" }[] = [];

    // Add all roles first (from API)
    roles.forEach((role) => {
      options.push({
        label: role,
        value: `role:${role}`,
        type: "role",
      });
    });

    // Then add all user IDs (from API)
    // const userIds = new Set<number>();
    // anomalies.forEach((a) => {
    //   if (a.userId !== undefined) {
    //     userIds.add(a.userId);
    //   }
    // });
    // const sorted = Array.from(userIds).sort((a, b) => a - b);
    const sorted = [...userIds].sort((a, b) => a - b);
    sorted.forEach((id) => {
      options.push({
        label: `user ${id}`,
        value: `user:${id}`,
        type: "user",
      });
    });

    return options;
  };

  useEffect(() => {
    handleGetAllAnomalies();
    fetchRolesAndUserIds();
  }, []);

  const fetchRolesAndUserIds = async () => {
    try {
      const [rolesData, userIdsData] = await Promise.all([
        uebaApi.getAllRoles(token),
        uebaApi.getAllUserIds(token)
      ]);
      console.log('Roles from API:', rolesData);
      console.log('User IDs from API:', userIdsData);
      
      // Extract arrays from response objects
      const rolesArray = Array.isArray(rolesData) ? rolesData : (rolesData as any).response || [];
      const userIdsArray = Array.isArray(userIdsData) ? userIdsData : (userIdsData as any).response || [];
      
      setRoles(rolesArray.filter((role: any) => role !== null && role !== undefined));
      setUserIds(userIdsArray.filter((id: any) => id !== null && id !== undefined));
    } catch (err) {
      console.error('Failed to fetch roles and user IDs:', err);
    }
  };

  const handleGetAllAnomalies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await uebaApi.getAllAnomalies(token);
      setAnomalies(data);
    } catch (err) {
      setError('Failed to fetch anomalies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSelect = async (filterValue: string) => {
    try {
      setLoading(true);
      setError(null);

      if (filterValue.startsWith('role:')) {
        const role = filterValue.split(':')[1];
        const data = await uebaApi.analyzeRoleBehavior(token, role);
        setAnomalies(data);
        setFilterValue("*"); // Reset filter since API already returns filtered data
      } else if (filterValue.startsWith('user:')) {
        const userId = parseInt(filterValue.split(':')[1]);
        const data = await uebaApi.analyzeUserBehavior(token, userId);
        setAnomalies(data);
        setFilterValue("*"); // Reset filter since API already returns filtered data
      }
    } catch (err) {
      setError('Failed to fetch anomalies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-2 border-[#282A28] bg-transparent rounded-[14px] p-4!">
      <div className="flex items-center gap-2! mb-4!">
        <MdOutlineAnalytics size={24} className="text-[#60cdff]" />
        <h2 className="text-xl font-semibold">User & Entity Behavior Analytics</h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4! p-3! bg-red-900 border border-red-700 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4! text-[#60cdff]">
          Loading anomalies...
        </div>
      )}

      {/* Graph and Filter */}
      {!loading && anomalies.length > 0 && (
        <>
          <AnomaliesGraph 
            anomalies={anomalies} 
            filterValue={filterValue}
          />
          <AnomaliesFilterSelect 
            value={filterValue}
            onChange={setFilterValue}
            onSelect={handleFilterSelect}
            options={getFilterOptions()}
          />
        </>
      )}

      {/* Anomalies Table */}
      {!loading && <AnomaliesTable anomalies={anomalies} />}
    </div>
  );
}
