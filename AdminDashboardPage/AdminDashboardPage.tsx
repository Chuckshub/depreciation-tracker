import { useQuery } from "react-query";
import { Helmet } from "react-helmet-async";
import { PageHeader, PageHeaderTitle } from "components/PageHeader/PageHeader";
import { Margins } from "components/Margins/Margins";
import { DashboardFullPage } from "modules/dashboard/DashboardLayout";
import { DeprecationTracker } from "./DeprecationTracker/DeprecationTracker";
import { PrepaidsModule } from "./PrepaidsModule/PrepaidsModule";
import { DashboardStats } from "./DashboardStats/DashboardStats";
import { templates } from "api/queries/templates";
import { workspaces } from "api/queries/workspaces";
import { users } from "api/queries/users";
import { useAuthenticated } from "hooks";
import type { FC } from "react";

export const AdminDashboardPage: FC = () => {
	const { permissions } = useAuthenticated();
	
	// Fetch data for dashboard
	const templatesQuery = useQuery(templates());
	const workspacesQuery = useQuery(workspaces({}));
	const usersQuery = useQuery(users({ q: "" }));

	return (
		<>
			<Helmet>
				<title>Admin Dashboard</title>
			</Helmet>
			<DashboardFullPage>
				<Margins>
					<PageHeader>
						<PageHeaderTitle>Admin Dashboard</PageHeaderTitle>
					</PageHeader>
					
					<div className="space-y-6">
						{/* Dashboard Stats Overview */}
						<DashboardStats 
							templates={templatesQuery.data}
							workspaces={workspacesQuery.data}
							users={usersQuery.data}
							loading={templatesQuery.isLoading || workspacesQuery.isLoading || usersQuery.isLoading}
						/>
						
						{/* Deprecation Tracker */}
						<DeprecationTracker 
							templates={templatesQuery.data}
							loading={templatesQuery.isLoading}
						/>
						
						{/* Prepaids Module */}
						<PrepaidsModule />
					</div>
				</Margins>
			</DashboardFullPage>
		</>
	);
};

export default AdminDashboardPage;