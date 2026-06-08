import { ReactNode } from "react";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";

interface ListPageStatesProps {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon?: string;
  emptyAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ListPageStates({
  loading,
  error,
  isEmpty,
  onRetry,
  loadingMessage,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  children,
  className = "",
}: ListPageStatesProps) {
  if (loading) {
    return <LoadingState message={loadingMessage} className={className} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} className={className} />;
  }

  if (isEmpty) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        action={emptyAction}
        className={className}
      />
    );
  }

  return <>{children}</>;
}
