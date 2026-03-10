const Loader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-4 border-muted rounded-full" />
      <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
    </div>
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
    <div className="w-full aspect-square bg-muted" />
    <div className="p-3 space-y-2">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="h-5 bg-muted rounded w-1/3" />
    </div>
  </div>
);

export default Loader;
