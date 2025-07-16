
import { Button } from "components/Button/Button";
import { Stack } from "components/Stack/Stack";
import { Pill } from "components/Pill/Pill";
import type { FC } from "react";
import { useState } from "react";
import { CreditCardIcon, PlusIcon, DollarSignIcon, CalendarIcon, UsersIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Mock data structure for prepaids - this will be replaced with real API calls
interface PrepaidCredit {
	id: string;
	name: string;
	amount: number;
	currency: string;
	usedAmount: number;
	status: 'active' | 'expired' | 'depleted';
	createdAt: string;
	expiresAt?: string;
	assignedUsers: number;
	totalUsers: number;
}

const mockPrepaids: PrepaidCredit[] = [
	{
		id: '1',
		name: 'Q1 2024 Development Credits',
		amount: 10000,
		currency: 'USD',
		usedAmount: 3500,
		status: 'active',
		createdAt: '2024-01-01T00:00:00Z',
		expiresAt: '2024-03-31T23:59:59Z',
		assignedUsers: 25,
		totalUsers: 30,
	},
	{
		id: '2',
		name: 'Intern Program Credits',
		amount: 5000,
		currency: 'USD',
		usedAmount: 4800,
		status: 'active',
		createdAt: '2024-02-15T00:00:00Z',
		expiresAt: '2024-08-15T23:59:59Z',
		assignedUsers: 8,
		totalUsers: 10,
	},
	{
		id: '3',
		name: 'Legacy Credits',
		amount: 2000,
		currency: 'USD',
		usedAmount: 2000,
		status: 'depleted',
		createdAt: '2023-12-01T00:00:00Z',
		expiresAt: '2024-02-29T23:59:59Z',
		assignedUsers: 5,
		totalUsers: 5,
	},
];

export const PrepaidsModule: FC = () => {
	const [prepaids] = useState<PrepaidCredit[]>(mockPrepaids);
	const [showCreateForm, setShowCreateForm] = useState(false);

	const activePrepaids = prepaids.filter(p => p.status === 'active');
	const totalCredits = prepaids.reduce((sum, p) => sum + p.amount, 0);
	const usedCredits = prepaids.reduce((sum, p) => sum + p.usedAmount, 0);
	const remainingCredits = totalCredits - usedCredits;

	return (
		<div className="border rounded-lg bg-white shadow-sm">
			<div className="p-6 border-b">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold flex items-center gap-2">
						<CreditCardIcon className="h-5 w-5 text-blue-500" />
						Prepaid Credits Management
						<Pill type="info">{activePrepaids.length} active</Pill>
					</h2>
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShowCreateForm(!showCreateForm)}
					>
						<PlusIcon className="h-4 w-4 mr-1" />
						Create Credit Pool
					</Button>
				</div>
			</div>
			<div className="p-6">
				{/* Summary Stats */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
					<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
						<div className="flex items-center gap-2 mb-2">
							<DollarSignIcon className="h-4 w-4 text-blue-600" />
							<span className="text-sm font-medium text-blue-800">Total Credits</span>
						</div>
						<div className="text-2xl font-bold text-blue-900">${totalCredits.toLocaleString()}</div>
					</div>
					
					<div className="bg-green-50 p-4 rounded-lg border border-green-200">
						<div className="flex items-center gap-2 mb-2">
							<DollarSignIcon className="h-4 w-4 text-green-600" />
							<span className="text-sm font-medium text-green-800">Remaining</span>
						</div>
						<div className="text-2xl font-bold text-green-900">${remainingCredits.toLocaleString()}</div>
					</div>
					
					<div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
						<div className="flex items-center gap-2 mb-2">
							<DollarSignIcon className="h-4 w-4 text-orange-600" />
							<span className="text-sm font-medium text-orange-800">Used</span>
						</div>
						<div className="text-2xl font-bold text-orange-900">${usedCredits.toLocaleString()}</div>
					</div>
				</div>

				{/* Create Form */}
				{showCreateForm && (
					<div className="mb-6 p-4 border rounded-lg bg-gray-50">
						<h3 className="font-medium mb-4">Create New Credit Pool</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">Pool Name</label>
								<input 
									type="text" 
									placeholder="e.g., Q2 2024 Development Credits"
									className="w-full px-3 py-2 border rounded-md"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Credit Amount (USD)</label>
								<input 
									type="number" 
									placeholder="10000"
									className="w-full px-3 py-2 border rounded-md"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Expiration Date</label>
								<input 
									type="date" 
									className="w-full px-3 py-2 border rounded-md"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Max Users</label>
								<input 
									type="number" 
									placeholder="50"
									className="w-full px-3 py-2 border rounded-md"
								/>
							</div>
						</div>
						<div className="flex gap-2 mt-4">
							<Button size="sm">Create Credit Pool</Button>
							<Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>Cancel</Button>
						</div>
					</div>
				)}

				{/* Credit Pools List */}
				<div className="space-y-4">
					{prepaids.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<CreditCardIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
							<p className="text-lg font-medium">No credit pools found</p>
							<p>Create your first prepaid credit pool to get started.</p>
						</div>
					) : (
						prepaids.map((prepaid) => (
							<PrepaidCreditCard key={prepaid.id} prepaid={prepaid} />
						))
					)}
				</div>
			</div>
		</div>
	);
};

interface PrepaidCreditCardProps {
	prepaid: PrepaidCredit;
}

const PrepaidCreditCard: FC<PrepaidCreditCardProps> = ({ prepaid }) => {
	const createdAt = new Date(prepaid.createdAt);
	const expiresAt = prepaid.expiresAt ? new Date(prepaid.expiresAt) : null;
	const usagePercentage = (prepaid.usedAmount / prepaid.amount) * 100;
	const userAssignmentPercentage = (prepaid.assignedUsers / prepaid.totalUsers) * 100;

	const getStatusColor = (status: PrepaidCredit['status']) => {
		switch (status) {
			case 'active': return 'bg-green-50 border-green-200';
			case 'expired': return 'bg-gray-50 border-gray-200';
			case 'depleted': return 'bg-red-50 border-red-200';
			default: return 'bg-gray-50 border-gray-200';
		}
	};

	const getStatusPill = (status: PrepaidCredit['status']) => {
		switch (status) {
			case 'active': return <Pill type="success">Active</Pill>;
			case 'expired': return <Pill type="secondary">Expired</Pill>;
			case 'depleted': return <Pill type="error">Depleted</Pill>;
			default: return <Pill type="secondary">Unknown</Pill>;
		}
	};

	return (
		<div className={`border rounded-lg p-4 ${getStatusColor(prepaid.status)}`}>
			<div className="flex items-start justify-between mb-4">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<h3 className="font-medium text-lg">{prepaid.name}</h3>
						{getStatusPill(prepaid.status)}
					</div>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<CalendarIcon className="h-4 w-4" />
							Created {formatDistanceToNow(createdAt, { addSuffix: true })}
						</div>
						{expiresAt && (
							<div className="flex items-center gap-1">
								<CalendarIcon className="h-4 w-4" />
								Expires {formatDistanceToNow(expiresAt, { addSuffix: true })}
							</div>
						)}
					</div>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">Manage Users</Button>
					<Button variant="outline" size="sm">View Usage</Button>
				</div>
			</div>

			{/* Usage Progress */}
			<div className="space-y-3">
				<div>
					<div className="flex justify-between text-sm mb-1">
						<span>Credit Usage</span>
						<span>${prepaid.usedAmount.toLocaleString()} / ${prepaid.amount.toLocaleString()}</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div 
							className={`h-2 rounded-full ${
								usagePercentage > 90 ? 'bg-red-500' : 
								usagePercentage > 75 ? 'bg-orange-500' : 'bg-blue-500'
							}`}
							style={{ width: `${Math.min(usagePercentage, 100)}%` }}
						/>
					</div>
				</div>

				<div>
					<div className="flex justify-between text-sm mb-1">
						<span className="flex items-center gap-1">
							<UsersIcon className="h-4 w-4" />
							User Assignment
						</span>
						<span>{prepaid.assignedUsers} / {prepaid.totalUsers}</span>
					</div>
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div 
							className="bg-green-500 h-2 rounded-full"
							style={{ width: `${Math.min(userAssignmentPercentage, 100)}%` }}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};