import { Skeleton } from "@/components/ui/skeleton";

export default function ProductPageSkeleton() {
  return (
    <div className="container-numar py-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-32 bg-muted rounded mb-6"></div>

      {/* Gallery */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        <div className="flex gap-3">
          <div className="hidden md:flex flex-col gap-2 w-20 shrink-0">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[3/4] w-20" />
            ))}
          </div>
          <Skeleton className="flex-1 aspect-[3/4]" />
        </div>

        {/* Product info */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>

      {/* Accordion */}
      <div className="mt-8">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Related */}
      <div className="mt-20">
        <Skeleton className="h-8 w-1/3 mx-auto mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[3/4]" />
          ))}
        </div>
      </div>
    </div>
  );
}