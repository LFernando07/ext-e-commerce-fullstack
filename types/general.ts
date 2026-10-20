export interface SearchParamsProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    race?: string;
  }>;
}