import { Skeleton, ProductGridSkeleton } from "@/components/shared/skeletons";

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-4 h-10 w-64" />
      <Skeleton className="mt-2 h-4 w-40" />
      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <div className="hidden lg:block">
          <Skeleton className="h-96 w-full" />
        </div>
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
