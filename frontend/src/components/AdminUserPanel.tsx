import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { adminService } from "../main";
import { useAppData } from "../context/useAppData";
import { AppCard, LoadingScreen } from "./ui/AppUI";
import { getErrorMessage } from "../utils/errors";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string | null;
  isBanned?: boolean;
};

const AdminUserPanel = () => {
  const { user: currentUser } = useAppData();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${adminService}/api/v1/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUsers(data.users || []);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateStatus = async (userId: string, isBanned: boolean) => {
    const action = isBanned ? "ban" : "unban";
    if (!window.confirm(`${action} this user?`)) return;

    try {
      setUpdatingId(userId);
      const { data } = await axios.patch(
        `${adminService}/api/v1/admin/users/${userId}/status`,
        { isBanned },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success(data.message);
      fetchUsers();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update user status"));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading users..." />;
  }

  return (
    <AppCard className="!p-0 overflow-hidden">
      <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <p className="text-sm font-bold text-gray-900 dark:text-white">
          User management
        </p>
        <p className="text-xs text-gray-500">
          {users.length} users · activate, ban, or unban accounts
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800/50">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isActive = !user.isBanned;
              const isSelf = String(user._id) === String(currentUser?._id);

              return (
                <tr
                  key={user._id}
                  className="border-t border-gray-100 dark:border-gray-800"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.image}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user.name}
                          {isSelf && (
                            <span className="ml-1.5 text-xs font-medium text-[#E23744] dark:text-[#ff6b7a]">
                              (You)
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {user.role || "no role"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isActive ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                        Banned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isSelf ? (
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                        —
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {isActive ? (
                          <>
                            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                              Active
                            </span>
                            <button
                              type="button"
                              disabled={updatingId === user._id}
                              onClick={() => updateStatus(user._id, true)}
                              className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/60"
                            >
                              Ban
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                              Banned
                            </span>
                            <button
                              type="button"
                              disabled={updatingId === user._id}
                              onClick={() => updateStatus(user._id, false)}
                              className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-950/60"
                            >
                              Unban
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AppCard>
  );
};

export default AdminUserPanel;
