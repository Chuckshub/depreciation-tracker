
import { Loader } from "components/Loader/Loader";
import { Stack } from "components/Stack/Stack";
import { Avatar } from "components/Avatar/Avatar";
import { Pill } from "components/Pill/Pill";
import { MemoizedInlineMarkdown } from "components/Markdown/Markdown";
import { Button } from "components/Button/Button";
import type { Template } from "api/typesGenerated";
import type { FC } from "react";
import { AlertTriangleIcon, ExternalLinkIcon, CalendarIcon, UsersIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface DeprecationTrackerProps {
	templates?: readonly Template[];
	loading: boolean;
}

export const DeprecationTracker: FC<DeprecationTrackerProps> = ({
	templates,
	loading,
}) => {
	if (loading) {
		return (
			<div className="border rounded-lg bg-white shadow-sm">
				<div className="p-6 border-b">
					<h2 className="text-xl font-semibold flex items-center gap-2">
						<AlertTriangleIcon className="h-5 w-5 text-orange-500" />
						Deprecation Tracker
					</h2>
				</div>
				<div className="p-6">
					<Loader />
				</div>
			</div>
		);
	}

	const deprecatedTemplates = templates?.filter(t => t.deprecated) || [];

	return (
		<div className="border rounded-lg bg-white shadow-sm">
			<div className="p-6 border-b">
				<h2 className="text-xl font-semibold flex items-center gap-2">
					<AlertTriangleIcon className="h-5 w-5 text-orange-500" />
					Deprecation Tracker
					<Pill type="warning">{deprecatedTemplates.length} deprecated</Pill>
				</h2>
			</div>
			<div className="p-6">
				{deprecatedTemplates.length === 0 ? (
					<div className="text-center py-8 text-muted-foreground">
						<AlertTriangleIcon className="h-12 w-12 mx-auto mb-4 text-green-500" />
						<p className="text-lg font-medium">No deprecated templates</p>
						<p>All templates are currently active and supported.</p>
					</div>
				) : (
					<div className="space-y-4">
						{deprecatedTemplates.map((template) => (
							<DeprecatedTemplateCard key={template.id} template={template} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

interface DeprecatedTemplateCardProps {
	template: Template;
}

const DeprecatedTemplateCard: FC<DeprecatedTemplateCardProps> = ({ template }) => {
	const updatedAt = new Date(template.updated_at);
	const timeAgo = formatDistanceToNow(updatedAt, { addSuffix: true });

	return (
		<div className="border rounded-lg p-4 bg-orange-50 border-orange-200">
			<div className="flex items-start justify-between">
				<div className="flex items-start gap-3 flex-1">
					<Avatar
						size="sm"
						variant="icon"
						src={template.icon}
						fallback={template.name}
					/>
					<div className="flex-1">
						<div className="flex items-center gap-2 mb-1">
							<h3 className="font-medium text-lg">
								{template.display_name || template.name}
							</h3>
							<Pill type="warning">Deprecated</Pill>
						</div>
						
						{template.deprecation_message && (
							<div className="mb-3 p-3 bg-orange-100 rounded border border-orange-200">
								<MemoizedInlineMarkdown>
									{template.deprecation_message}
								</MemoizedInlineMarkdown>
							</div>
						)}
						
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<div className="flex items-center gap-1">
								<UsersIcon className="h-4 w-4" />
								{template.active_user_count} active users
							</div>
							<div className="flex items-center gap-1">
								<CalendarIcon className="h-4 w-4" />
								Deprecated {timeAgo}
							</div>
							<div className="text-xs">
								Org: {template.organization_name}
							</div>
						</div>
					</div>
				</div>
				
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						asChild
					>
						<Link to={`/templates/${template.name}`}>
							<ExternalLinkIcon className="h-4 w-4 mr-1" />
							View Template
						</Link>
					</Button>
					<Button
						variant="outline"
						size="sm"
						asChild
					>
						<Link to={`/templates/${template.name}/settings`}>
							Manage
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
};