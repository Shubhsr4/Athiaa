export function getPaginationParams(requestUrl: string | URL) {
  const url = typeof requestUrl === 'string' ? new URL(requestUrl) : requestUrl;
  const pageStr = url.searchParams.get('page');
  const perPageStr = url.searchParams.get('per_page');

  let page = parseInt(pageStr || '1', 10);
  if (isNaN(page) || page < 1) page = 1;

  let perPage = parseInt(perPageStr || '20', 10);
  if (isNaN(perPage) || perPage < 1) perPage = 20;
  if (perPage > 100) perPage = 100;

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  return { page, perPage, from, to };
}

export function createPaginationMeta(total: number, page: number, per_page: number) {
  const total_pages = Math.ceil(total / per_page) || 1;
  return {
    total,
    page,
    per_page,
    total_pages,
  };
}

