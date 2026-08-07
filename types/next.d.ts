declare module 'next/headers' {
  export function cookies(): {
    getAll(): Array<{ name: string; value: string }>;
    get(name: string): { name: string; value: string } | undefined;
    set(name: string, value: string, options?: any): void;
    delete(name: string): void;
  };
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    refresh(): void;
    back(): void;
    forward(): void;
    prefetch(href: string): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): {
    get(key: string): string | null;
    getAll(key: string): string[];
    has(key: string): boolean;
    toString(): string;
  };
}

declare module 'next/server' {
  export class NextRequest extends Request {
    constructor(input: any, init?: any);
    nextUrl: {
      pathname: string;
      searchParams: URLSearchParams;
      clone(): any;
    };
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      set(name: string, value: string, options?: any): void;
      delete(name: string): void;
    };
  }

  export class NextResponse extends Response {
    static next(init?: any): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static json(body: any, init?: any): NextResponse;
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      set(name: string, value: string, options?: any): void;
      delete(name: string): void;
    };
  }
}
