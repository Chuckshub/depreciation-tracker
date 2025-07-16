import { Loader } from "components/Loader/Loader";
import type { Template, GetWorkspacesResponse, GetUsersResponse } from "api/typesGenerated";
import type { FC } from "react";
import { AlertTriangleIcon, UsersIcon, ServerIcon, ArchiveIcon } from "lucide-react";

interface DashboardStatsProps {
	templates?: readonly Template[];
	workspaces?: GetWorkspacesResponse;
	users?: GetUsersResponse;
	loading: boolean;
}

export const DashboardStats: FC<DashboardStatsProps> = ({
	templates,
	workspaces,
	users,
	loading,
}) => {
	if (loading) {
		return (
			<div className="border rounded-lg p-6 bg-white shadow-sm">
				<Loader />
			</div>
		);
	}

	const deprecatedTemplates = templates?.filter(t => t.deprecated) || [];
	const activeTemplates = templates?.filter(t => !t.deprecated) || [];
	const totalWorkspaces = workspaces?.count || 0;
	const totalUsers = users?.count || 0;

	return (
		<div>
			<h2 className="text-xl font-semibold mb-4">System Overview</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div className="border rounded-lg p-4 bg-white shadow-sm">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-medium text-gray-600">Total Users</h3>
						<UsersIcon className="h-4 w-4 text-gray-400" />
					</div>
					<div className="text-2xl font-bold">{totalUsers}</div>
				</div>

				<div className="border rounded-lg p-4 bg-white shadow-sm">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-medium text-gray-600">Total Workspaces</h3>
						<ServerIcon className="h-4 w-4 text-gray-400" />
					</div>
					<div className="text-2xl font-bold">{totalWorkspaces}</div>
				</div>

				<div className="border rounded-lg p-4 bg-white shadow-sm">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-medium text-gray-600">Active Templates</h3>
						<ArchiveIcon className="h-4 w-4 text-gray-400" />
					</div>
					<div className="text-2xl font-bold">{activeTemplates.length}</div>
				</div>

				<div className="border rounded-lg p-4 bg-white shadow-sm">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-medium text-gray-600">Deprecated Templates</h3>
						<AlertTriangleIcon className="h-4 w-4 text-orange-500" />
					</div>
					<div className="text-2xl font-bold text-orange-600">{deprecatedTemplates.length}</div>
				</div>
			</div>
		</div>
	);
};